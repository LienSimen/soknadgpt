import React, { useState, useEffect } from 'react';
import {
  VStack,
  Checkbox,
  Text,
  Box,
  Divider,
  useDisclosure,
  Collapse,
  Button,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

export interface CoverLetterOptionsData {
  styleOptions: {
    conversationalTone: boolean;
    varySentenceLength: boolean;
    addPersonalAnecdote: boolean;
  };
  contentOptions: {
    useIndustryTerminology: boolean;
    includeConfidentUncertainty: boolean;
    addRhetoricalQuestion: boolean;
  };
  antiAiOptions: {
    addTyposAndInformalSpelling: boolean;
    useRegionalExpressions: boolean;
    includeIncompleteThoughts: boolean;
    mixFormalInformalRegisters: boolean;
    addPersonalInterjections: boolean;
    useRunOnSentences: boolean;
    includeSelfCorrections: boolean;
    jumpBetweenTopics: boolean;
    includePersonalOpinions: boolean;
    referenceCurrentTrends: boolean;
  };
}

export interface CoverLetterOptionsProps {
  onChange: (options: CoverLetterOptionsData) => void;
  initialOptions?: CoverLetterOptionsData;
}

const defaultOptions: CoverLetterOptionsData = {
  styleOptions: {
    conversationalTone: false,
    varySentenceLength: false,
    addPersonalAnecdote: false,
  },
  contentOptions: {
    useIndustryTerminology: false,
    includeConfidentUncertainty: false,
    addRhetoricalQuestion: false,
  },
  antiAiOptions: {
    addTyposAndInformalSpelling: false,
    useRegionalExpressions: false,
    includeIncompleteThoughts: false,
    mixFormalInformalRegisters: false,
    addPersonalInterjections: false,
    useRunOnSentences: false,
    includeSelfCorrections: false,
    jumpBetweenTopics: false,
    includePersonalOpinions: false,
    referenceCurrentTrends: false,
  },
};

const STORAGE_KEY = 'coverLetterOptions';

export const CoverLetterOptions: React.FC<CoverLetterOptionsProps> = ({
  onChange,
  initialOptions,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [options, setOptions] = useState<CoverLetterOptionsData>(() => {
    if (initialOptions) return initialOptions;

    // Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedOptions = JSON.parse(saved);
        // Merge with defaultOptions to ensure all properties exist
        return {
          styleOptions: { ...defaultOptions.styleOptions, ...parsedOptions.styleOptions },
          contentOptions: { ...defaultOptions.contentOptions, ...parsedOptions.contentOptions },
          antiAiOptions: { ...defaultOptions.antiAiOptions, ...parsedOptions.antiAiOptions },
        };
      }
      return defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  // Save to localStorage and notify parent when options change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.warn('Failed to save options to localStorage:', error);
    }
    onChange(options);
  }, [options, onChange]);

  const updateStyleOption = (key: keyof CoverLetterOptionsData['styleOptions'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      styleOptions: {
        ...prev.styleOptions,
        [key]: value,
      },
    }));
  };

  const updateContentOption = (key: keyof CoverLetterOptionsData['contentOptions'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      contentOptions: {
        ...prev.contentOptions,
        [key]: value,
      },
    }));
  };

  const updateAntiAiOption = (key: keyof CoverLetterOptionsData['antiAiOptions'], value: boolean) => {
    setOptions(prev => ({
      ...prev,
      antiAiOptions: {
        ...prev.antiAiOptions,
        [key]: value,
      },
    }));
  };

  return (
    <VStack
      border="sm"
      bg="bg-contrast-xs"
      borderRadius={0}
      alignItems="flex-start"
      _hover={{
        bg: 'bg-contrast-md',
        borderColor: 'border-contrast-md',
      }}
      transition="transform 0.05s ease-in, transform 0.05s ease-out, background 0.3s, opacity 0.3s, border 0.3s"
    >
      <Button
        variant="ghost"
        onClick={onToggle}
        w="full"
        justifyContent="space-between"
        px={3}
        py={2}
        h="auto"
        fontWeight="normal"
        fontSize="sm"
        color="text-contrast-md"
        _hover={{
          color: 'text-contrast-lg',
          bg: 'transparent',
        }}
        aria-expanded={isOpen}
        aria-controls="cover-letter-options-content"
      >
        <Text color="text-contrast-md">Tilpasningsalternativer</Text>
        <Icon as={isOpen ? ChevronUpIcon : ChevronDownIcon} />
      </Button>

      <Collapse in={isOpen} style={{ width: '100%' }}>
        <VStack px={3} pb={3} spacing={3} alignItems="flex-start" w="full" id="cover-letter-options-content">
          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" color="text-contrast-lg" mb={2}>
              Stilalternativer:
            </Text>
            <VStack spacing={2} alignItems="flex-start">
              <Tooltip
                label="Gjør brevet mer uformelt og vennlig, som om du snakker direkte med arbeidsgiveren"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.styleOptions.conversationalTone}
                    onChange={(e) => updateStyleOption('conversationalTone', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Samtalepreget tone
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Blander korte og lange setninger for bedre flyt og lesbarhet"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.styleOptions.varySentenceLength}
                    onChange={(e) => updateStyleOption('varySentenceLength', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Variere setningslengde
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Inkluderer en kort, relevant personlig historie som viser din lidenskap for feltet"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.styleOptions.addPersonalAnecdote}
                    onChange={(e) => updateStyleOption('addPersonalAnecdote', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Legg til personlig anekdote
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
            </VStack>
          </Box>

          <Divider />

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" color="text-contrast-lg" mb={2}>
              Innholdsalternativer:
            </Text>
            <VStack spacing={2} alignItems="flex-start">
              <Tooltip
                label="Bruker fagspesifikke ord og uttrykk som viser at du kjenner bransjen"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.contentOptions.useIndustryTerminology}
                    onChange={(e) => updateContentOption('useIndustryTerminology', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Bruk bransjeterminologi
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Viser ydmykhet og lærevillighet samtidig som du fremstår selvsikker på dine evner"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.contentOptions.includeConfidentUncertainty}
                    onChange={(e) => updateContentOption('includeConfidentUncertainty', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Inkluder selvsikker usikkerhet
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Stiller et gjennomtenkt spørsmål som engasjerer leseren og viser din forståelse av rollen"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.contentOptions.addRhetoricalQuestion}
                    onChange={(e) => updateContentOption('addRhetoricalQuestion', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Legg til retorisk spørsmål
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
            </VStack>
          </Box>

          <Divider />

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" color="text-contrast-lg" mb={2}>
              Naturlig skriving (Anti-AI):
            </Text>
            <VStack spacing={2} alignItems="flex-start">
              <Tooltip
                label="Legger til små skrivefeil og uformelle stavemåter som mennesker naturlig gjør"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.addTyposAndInformalSpelling}
                    onChange={(e) => updateAntiAiOption('addTyposAndInformalSpelling', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Små skrivefeil og uformell staving
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Bruker lokale uttrykk og slang som gjør teksten mer autentisk norsk"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.useRegionalExpressions}
                    onChange={(e) => updateAntiAiOption('useRegionalExpressions', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Regionale uttrykk og slang
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Inkluderer ufullstendige tanker som naturlig avsluttes, som ekte tale"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.includeIncompleteThoughts}
                    onChange={(e) => updateAntiAiOption('includeIncompleteThoughts', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Ufullstendige tanker
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Blander formelt og uformelt språk i samme avsnitt, som folk gjør naturlig"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.mixFormalInformalRegisters}
                    onChange={(e) => updateAntiAiOption('mixFormalInformalRegisters', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Blande formelt og uformelt språk
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Legger til norske fylleord som 'forresten', 'altså', 'liksom' for naturlig flyt"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.addPersonalInterjections}
                    onChange={(e) => updateAntiAiOption('addPersonalInterjections', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Personlige utrop og fylleord
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Bruker lange, sammenhengende setninger når man blir engasjert, som ekte entusiasme"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.useRunOnSentences}
                    onChange={(e) => updateAntiAiOption('useRunOnSentences', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Lange, sammenhengende setninger
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Inkluderer selvrettelser som 'eller rettere sagt' som viser naturlig tenkning"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.includeSelfCorrections}
                    onChange={(e) => updateAntiAiOption('includeSelfCorrections', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Selvrettelser og omformuleringer
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Hopper mellom emner naturlig, som ekte samtaler gjør"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.jumpBetweenTopics}
                    onChange={(e) => updateAntiAiOption('jumpBetweenTopics', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Hoppe mellom emner
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Inkluderer personlige meninger som ikke er perfekt balanserte, som ekte mennesker har"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.includePersonalOpinions}
                    onChange={(e) => updateAntiAiOption('includePersonalOpinions', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Personlige meninger
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
              <Tooltip
                label="Refererer til aktuelle trender eller hendelser når det er relevant for jobben"
                hasArrow
                placement="top"
                bg="gray.700"
                color="white"
                fontSize="xs"
              >
                <Box>
                  <Checkbox
                    isChecked={options.antiAiOptions.referenceCurrentTrends}
                    onChange={(e) => updateAntiAiOption('referenceCurrentTrends', e.target.checked)}
                    size="sm"
                  >
                    <Text fontSize="sm" color="text-contrast-md">
                      Referere til aktuelle trender
                    </Text>
                  </Checkbox>
                </Box>
              </Tooltip>
            </VStack>
          </Box>
        </VStack>
      </Collapse>
    </VStack>
  );
};

export default CoverLetterOptions;