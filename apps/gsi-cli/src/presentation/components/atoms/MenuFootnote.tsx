import { Box, Text } from "ink";
import { CliSectionDivider } from "./CliSectionDivider";

interface MenuFootnoteProps {
  children: string;
}

/** Línea borde-a-borde y ayuda indentada como el resto del contenido. */
export function MenuFootnote({ children }: MenuFootnoteProps) {
  return (
    <>
      <CliSectionDivider />
      <Box paddingX={1}>
        <Text color="gray">{children}</Text>
      </Box>
    </>
  );
}
