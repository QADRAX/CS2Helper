import { Box, Text } from "ink";
import { CliSectionDivider } from "./CliSectionDivider";

interface MenuHeadingProps {
  title: string;
  color?: string;
}

/** Título indentado y línea inferior de ancho completo dentro del borde. */
export function MenuHeading({ title, color }: MenuHeadingProps) {
  return (
    <>
      <Box paddingX={1}>
        <Text bold {...(color ? { color } : {})}>
          {title}
        </Text>
      </Box>
      <CliSectionDivider />
    </>
  );
}
