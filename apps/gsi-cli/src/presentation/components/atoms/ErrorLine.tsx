import { Text } from "ink";

interface ErrorLineProps {
  message: string;
}

export function ErrorLine({ message }: ErrorLineProps) {
  return (
    <Text color="red" wrap="wrap">
      Error: {message}
    </Text>
  );
}
