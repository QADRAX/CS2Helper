export const createGetStateUseCase = ({ state }) => {
    return {
        execute() {
            return state.getState();
        },
    };
};
