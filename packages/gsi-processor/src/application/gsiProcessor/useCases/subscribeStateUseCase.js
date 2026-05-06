export const createSubscribeStateUseCase = ({ state }) => {
    return {
        execute(listener) {
            return state.subscribeState(listener);
        },
    };
};
