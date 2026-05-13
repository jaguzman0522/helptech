declare module 'cookie-cutter' {
    interface CookieOptions {
        path?: string;
        expires?: Date;
        domain?: string;
        secure?: boolean;
    }

    function get(key: string): string | undefined;
    function set(key: string, value: string, options?: CookieOptions): void;

    const cookie: {
        get: typeof get;
        set: typeof set;
    };

    export default cookie;
}
