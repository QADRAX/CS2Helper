/** Clock adapter backed by the local system time. */
export function createSystemClock() {
    return {
        now() {
            return Date.now();
        },
    };
}
