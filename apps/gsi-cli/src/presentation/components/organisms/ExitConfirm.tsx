import { Text } from "ink";

export function ExitConfirm() {
  return (
    <>
      <Text bold color="yellow">
        Exit CLI?
      </Text>
      <Text>Press Enter or Y to confirm, N or Esc to cancel.</Text>
    </>
  );
}
