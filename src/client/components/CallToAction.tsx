import { VStack, HStack, Text, Link, Divider } from "@chakra-ui/react";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { Link as WaspLink } from "wasp/client/router";

export function Footer() {
  return (
    <VStack width="full" py={5} textAlign="center" gap={4}>
      <Divider />
      <VStack gap={3}>
        <Link
          href="https://github.com/LienSimen/soknadgpt"
          color="purple.300"
          target="_blank"
        >
          <HStack justify="center">
            <FaGithub />
            <Text fontSize="sm" color="purple.300">
              Bygget med Wasp & 100% åpen kildekode, forket av vincanger{" "}
              <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  style={{ color: "#D53F8C", marginLeft: "4px" }}
                  viewBox="0 0 16 16"
                >
                  <path d="M8 14s5-3.33 5-7.5S10.5 2 8 4.5 3 2 3 6.5 8 14 8 14z" />
                </svg>
              </span>
            </Text>
          </HStack>
        </Link>
        <Text fontSize="sm" color="purple.300">
          Lien Tech - Orgnr. 935820057, Bergen, Norge - Alle priser inkl. mva
        </Text>
        <WaspLink to="/tos">
          <Text fontSize="sm" color="purple.300">
            Brukerbetingelser
          </Text>
        </WaspLink>
        <WaspLink to="/privacy">
          <Text fontSize="sm" color="purple.300">
            Personvern
          </Text>
        </WaspLink>
      </VStack>
    </VStack>
  );
}
