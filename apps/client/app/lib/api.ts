import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";

type TrackedRequestConfig = AxiosRequestConfig & { _sonnerToastId?: string | number };
type RefreshToken = () => Promise<string | null>;

const baseURL = "https://hms-d740.onrender.com/api/v1/";


export const api = axios.create({ baseURL, withCredentials: true });

export const refreshApi = axios.create({ baseURL, withCredentials: true });

const sessionHandlers = new Map<number, { getAccessToken: () => string | null; refreshToken: RefreshToken }>();

let nextHandlerId = 0;

let ejectInterceptors: (() => void) | null = null;

function getActiveHandlers() {
    const handlers = Array.from(sessionHandlers.values()).at(-1);
    return handlers ?? { getAccessToken: () => null, refreshToken: async () => null };
}

function requestLabel(_config: AxiosRequestConfig) {
    return "from server";
}

function apiErrorMessage(error: any) {
    const data = error?.response?.data?.error;
    if (typeof data?.message === "string") return `${data.message} → ${data.code}`;
    if (typeof data?.code === "string") return data.code;
    console.log(error?.response);
    return error?.response ? "Request failed" : "Network error";
}


export function configureApiClient(
    tokenGetter: () => string | null,
    refreshHandler: RefreshToken,
) {
    const handlerId = ++nextHandlerId;
    sessionHandlers.set(handlerId, { getAccessToken: tokenGetter, refreshToken: refreshHandler });

    if (!ejectInterceptors) {
        const requestInterceptor = api.interceptors.request.use((config) => {
            const trackedConfig = config as typeof config & { _sonnerToastId?: string | number };
            const url = config.url ?? "";
            const isLoginOrRefresh = /(?:^|\/)auth\/(?:login|refresh|forgot-password|reset-password)(?:$|[/?])/.test(url);
            const isShiftApiRequest = /(?:^|\/)shifts(?:\/|$)/.test(url);
            const isBookingApiRequest = /(?:^|\/)bookings(?:\/|$)/.test(url);
            const token = getActiveHandlers().getAccessToken();
            if (token && !isLoginOrRefresh) {
                config.headers.set("Authorization", `Bearer ${token}`);
            }
            if (!isLoginOrRefresh && !isShiftApiRequest && !isBookingApiRequest && typeof window !== "undefined" && !trackedConfig._sonnerToastId) {
                trackedConfig._sonnerToastId = toast.loading(`Requesting ${requestLabel(config)}…`, {
                    description: "Waiting for the server",
                });
            }
            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                const config = response.config as typeof response.config & { _sonnerToastId?: string | number };
                if (config._sonnerToastId !== undefined) {
                    const responseMessage = response.data?.message;
                    toast.success(` ${response.status}`, {
                        id: config._sonnerToastId,
                        description: typeof responseMessage === "string" ? responseMessage : "Request completed successfully",
                    });
                }
                return response;
            },
            async (error) => {
                const request = error?.config as (TrackedRequestConfig & { _retry?: boolean }) | undefined;
                const url = request?.url ?? "";
                const isExpectedNoOpenShift = error?.response?.status === 404 && /(?:^|\/)shifts\/current(?:$|[/?])/.test(url);
                const isAuthRequest = /(?:^|\/)auth\/(?:login|logout|refresh|forgot-password|reset-password)(?:$|[/?])/.test(url)
                    || /(?:^|\/)users\/invites\/[^/]+\/verify(?:$|[/?])/.test(url)
                    || /(?:^|\/)users\/invites\/accept(?:$|[/?])/.test(url);

                if (isExpectedNoOpenShift) {
                    if (request?._sonnerToastId !== undefined) toast.dismiss(request._sonnerToastId);
                    return Promise.reject(error);
                }

                if (error?.response?.status === 401 && request && !request._retry && !isAuthRequest) {
                    request._retry = true;
                    const nextToken = await getActiveHandlers().refreshToken();
                    if (nextToken) {
                        request.headers = { ...request.headers, Authorization: `Bearer ${nextToken}` };
                        return api(request);
                    }
                    if (request._sonnerToastId !== undefined) toast.dismiss(request._sonnerToastId);
                    return Promise.reject(error);
                }

                if (request?._sonnerToastId !== undefined) {
                    toast.error(apiErrorMessage(error), { id: request._sonnerToastId });
                }
                return Promise.reject(error);
            },
        );

        ejectInterceptors = () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }

    return () => {
        sessionHandlers.delete(handlerId);
        if (sessionHandlers.size === 0) {
            ejectInterceptors?.();
            ejectInterceptors = null;
        }
    };
}
