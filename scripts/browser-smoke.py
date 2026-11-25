"""Offline Chrome smoke test using the W3C WebDriver protocol, no pip packages."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / "docs/explore/index.html").as_uri()
DRIVER = shutil.which("chromedriver") or str(
    Path(os.environ.get("CHROMEWEBDRIVER", "")) / "chromedriver"
)
BROWSER = shutil.which("google-chrome") or shutil.which("chromium")
assert BROWSER, "Chrome/Chromium is required"


def request(method, path, data=None):
    req = Request(
        "http://127.0.0.1:" + str(port) + path,
        data=None if data is None else json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method=method,
    )
    with urlopen(req, timeout=20) as res:
        return json.load(res)["value"]


def execute(script):
    return request("POST", prefix + "/execute/sync", {"script": script, "args": []})


def click(selector):
    el = request("POST", prefix + "/element", {"using": "css selector", "value": selector})
    eid = el["element-6066-11e4-a52e-4f735466cecf"]
    request("POST", prefix + "/element/" + eid + "/click", {})


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print("PASS:", message, flush=True)


with tempfile.TemporaryDirectory() as temp:
    # Select a free loopback port; the runner has no shared browser session.
    import socket
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    proc = subprocess.Popen(
        [DRIVER, "--port=" + str(port), "--allowed-ips=127.0.0.1"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(100):
            try:
                request("GET", "/status")
                break
            except OSError:
                time.sleep(0.1)
        else:
            raise RuntimeError("ChromeDriver failed to start")
        session = request("POST", "/session", {
            "capabilities": {"alwaysMatch": {
                "browserName": "chrome",
                "goog:chromeOptions": {
                    "binary": BROWSER,
                    "args": ["--headless=new", "--disable-dev-shm-usage",
                             "--no-first-run", "--window-size=1280,900",
                             "--user-data-dir=" + temp],
                },
                "goog:loggingPrefs": {"browser": "ALL", "performance": "ALL"},
            }}
        })
        prefix = "/session/" + session["sessionId"]
        try:
            def cdp(cmd, params):
                return request("POST", prefix + "/goog/cdp/execute",
                               {"cmd": cmd, "params": params})

            cdp("Emulation.setEmulatedMedia", {
                "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]
            })
            request("POST", prefix + "/url", {"url": URL})
            check(execute("return document.readyState") == "complete", "desktop document loaded")
            check(execute("return !!document.querySelector('canvas').getContext('2d')"),
                  "real Canvas 2D context")
            check(execute("return document.querySelector('#projects').children.length") == 4,
                  "four default project links")
            check(execute("return document.querySelector('#motion').getAttribute('aria-pressed')") == "false",
                  "reduced motion honored")
            click('[data-sector="3"]')
            check(execute("return document.querySelector('#detail-title').textContent") == "Developer tools",
                  "sector navigation")
            check(execute("return [...document.querySelectorAll('#projects a')].some(a=>a.href==='https://github.com/Neguchads/navi-githomepage')"),
                  "canonical renamed Homepage link")
            check(execute("return [...document.querySelectorAll('#projects a')].some(a=>a.href==='https://github.com/Neguchads/navi-abyss')"),
                  "canonical renamed Abyss link")
            click("#language")
            check(execute("return document.documentElement.lang") == "pt-BR",
                  "language switch")
            check(execute("return document.querySelector('#detail-title').textContent") == "Ferramentas de desenvolvimento",
                  "Portuguese sector label")
            click("#reset")
            check(execute("return yaw===-.55 && pitch===.38 && distance===12"),
                  "camera reset")
            execute("document.querySelector('canvas').focus();")
            cdp("Input.dispatchKeyEvent", {"type": "keyDown", "key": "ArrowRight",
                                           "code": "ArrowRight", "windowsVirtualKeyCode": 39})
            cdp("Input.dispatchKeyEvent", {"type": "keyUp", "key": "ArrowRight",
                                           "code": "ArrowRight", "windowsVirtualKeyCode": 39})
            check(execute("return yaw>-.55"), "keyboard camera navigation")
            cdp("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 2, "mobile": True
            })
            cdp("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 1})
            request("POST", prefix + "/url", {"url": URL})
            check(execute("return document.documentElement.scrollWidth<=innerWidth"),
                  "mobile viewport has no horizontal overflow")
            click('[data-sector="1"]')
            check(execute("return document.querySelector('#projects').children.length") == 2,
                  "mobile sector navigation")
            browser_logs = request("POST", prefix + "/log", {"type": "browser"})
            check(not [x for x in browser_logs if x["level"] == "SEVERE"],
                  "no severe browser console errors")
            logs = request("POST", prefix + "/log", {"type": "performance"})
            urls = []
            for item in logs:
                event = json.loads(item["message"])["message"]
                if event.get("method") == "Network.requestWillBeSent":
                    urls.append(event["params"]["request"]["url"])
            check(not any(u.startswith(("http://", "https://")) for u in urls),
                  "offline explorer makes no network requests")
            # Exercise the actual Universe renderer with hostile public labels.
            cdp("Emulation.clearDeviceMetricsOverride", {})
            marker = '<img id="injected" src=x onerror="window.injected=1">'
            fixture = {
                "date": "2026-11-25",
                "totals": {"public_repositories": 1, "active_originals": 1,
                           "stars": 0, "forks": 0, "open_items": 0, "followers": 0},
                "sectors": [{"id": "s0", "en": "Test", "pt": "Teste", "color": "#63daff",
                             "pos": [1, 0, 1], "projects": [{"slug": "test", "title": marker,
                             "language": "C", "stars": 0, "forks": 0, "open_items": 0}]}],
                "featured": [], "integrations": [], "structural": {}, "languages": {},
                "history": [], "core_status": None,
            }
            template = (ROOT / "docs/universe/template.html").read_text(encoding="utf-8")
            source = (ROOT / "docs/universe/universe.js").read_text(encoding="utf-8")
            page = Path(temp) / "universe-security.html"
            page.write_text(template.replace("/*THEME*/", "").replace(
                "/*DATA*/", json.dumps(fixture).replace("<", "\\u003c")).replace(
                "/*SCRIPT*/", source), encoding="utf-8")
            request("POST", prefix + "/url", {"url": page.as_uri()})
            check(execute("return [...document.querySelectorAll('#nodes button')].some(b=>b.textContent.includes('id=\"injected\"'))"),
                  "Universe renders hostile label as literal text")
            check(execute("return !document.getElementById('injected') && !window.injected"),
                  "Universe hostile label does not become executable DOM")
        finally:
            request("DELETE", prefix)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
