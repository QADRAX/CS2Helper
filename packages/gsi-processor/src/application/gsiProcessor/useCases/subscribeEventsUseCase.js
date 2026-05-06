export const createSubscribeEventsUseCase = ({ events }) => {
    return {
        execute(listener) {
            return events.subscribe(listener);
        },
    };
};
