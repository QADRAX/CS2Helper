import { Text } from "ink";

interface ErrorMessageLineProps {
  message: string;
}

export function ErrorMessageLine({ message }: ErrorMessageLineProps) {
  return <Text color="red">Error: {message}</Text>;
}
