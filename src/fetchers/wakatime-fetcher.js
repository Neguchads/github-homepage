import axios from "axios";
import { CustomError, MissingParamError } from "../common/utils.js";

/**
 * Fetch public WakaTime statistics from the official service only.
 * @param {{username: string, api_domain: string}} props Fetcher props.
 * @returns {Promise<WakaTimeData>} WakaTime data response.
 */
const fetchWakatimeStats = async ({ username, api_domain } = {}) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  if (
    typeof username !== "string" ||
    !/^[A-Za-z0-9_.-]{1,100}$/.test(username) ||
    username === "." ||
    username === ".."
  ) {
    throw new CustomError("Invalid WakaTime username", "INVALID_USERNAME");
  }
  if (
    api_domain !== undefined &&
    (typeof api_domain !== "string" || !/^wakatime\.com\/?$/i.test(api_domain))
  ) {
    throw new CustomError(
      "Unsupported WakaTime API domain",
      "INVALID_API_DOMAIN",
    );
  }

  const url = `https://wakatime.com/api/v1/users/${encodeURIComponent(username)}/stats?is_including_today=true`;
  try {
    const { data } = await axios.get(url, {
      maxRedirects: 0,
      timeout: 10000,
      maxContentLength: 2 * 1024 * 1024,
    });
    return data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw new CustomError("WakaTime request failed", "WAKATIME_REQUEST_FAILED");
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
