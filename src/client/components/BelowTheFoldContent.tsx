import React from 'react';
import {
    Box,
    HStack,
    VStack,
    Heading,
    Text,
    SimpleGrid,
    Icon,
    Flex,
    Divider,
    Container,
    Link,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import { Link as WaspLink } from "wasp/client/router";

// Custom LightningIcon since @chakra-ui/icons does not export one
const LightningIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M7 2v13h3v7l7-12h-4l4-8z"
        />
    </Icon>
);

export default function BelowTheFoldContent() {
    return (
        <>
            {/* Value Proposition Section */}
            <Container maxW="container.lg" mt={12} px={0}>
                <VStack spacing={8}>

                    {/* Main Value Proposition */}
                    <Box textAlign="center" maxW="800px">
                        <Heading size="lg" mb={4} color="purple.600">
                            Prøv 3 helt gratis
                        </Heading>

                        <Heading size="lg" mb={4} color="purple.600">
                            Det beste pengene kan kjøpe - til en billig pris
                        </Heading>
                        <Text fontSize="lg" color="text-contrast-md" lineHeight={1.8}>
                            Powered by GPT-4o, den beste modellen, for kun 49kr for 50 søknadsbrev, og leverer på sekunder i stedet for dager.
                        </Text>
                    </Box>

                    {/* Key Benefits Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                        <VStack
                            p={6}
                            bg="bg-contrast-xs"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border-contrast-sm"
                            _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                            transition="all 0.3s"
                        >
                            <Icon as={LightningIcon} w={8} h={8} color="purple.500" />
                            <Text fontWeight="bold" fontSize="md">Sekunder</Text>
                            <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                Levering av søknadsbrev på sekunder – ikke dager
                            </Text>
                        </VStack>

                        <VStack
                            p={6}
                            bg="bg-contrast-xs"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border-contrast-sm"
                            _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                            transition="all 0.3s"
                        >
                            <Icon as={StarIcon} w={8} h={8} color="purple.500" />
                            <Text fontWeight="bold" fontSize="md">Premium</Text>
                            <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                Beste AI-modell GPT-4o for alle
                            </Text>
                        </VStack>

                        <VStack
                            p={6}
                            bg="bg-contrast-xs"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border-contrast-sm"
                            _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                            transition="all 0.3s"
                        >
                            <Icon as={CheckCircleIcon} w={8} h={8} color="purple.500" />
                            <Text fontWeight="bold" fontSize="md">Under 1 krone</Text>
                            <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                Ingen skjulte kostnader
                            </Text>
                        </VStack>

                        <VStack
                            p={6}
                            bg="bg-contrast-xs"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="border-contrast-sm"
                            _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                            transition="all 0.3s"
                        >
                            <Icon as={TimeIcon} w={8} h={8} color="purple.500" />
                            <Text fontWeight="bold" fontSize="md">Finn.no integrasjon</Text>
                            <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                Automatisk utfylling av jobbinfo
                            </Text>
                        </VStack>
                    </SimpleGrid>

                    <Divider />

                    {/* Best Practices Section */}
                    <Box maxW="800px" textAlign="left">
                        <Heading size="md" mb={4} color="purple.600">
                            Slik får du det beste resultat
                        </Heading>
                        <VStack spacing={3} alignItems="flex-start">
                            <HStack>
                                <Icon as={CheckCircleIcon} color="green.500" />
                                <Text fontSize="sm">
                                    <strong>Kjør 3-5 ganger:</strong> Hver generering er unik - velg den beste varianten
                                </Text>
                            </HStack>
                            <HStack>
                                <Icon as={CheckCircleIcon} color="green.500" />
                                <Text fontSize="sm">
                                    <strong>Juster kreativitet:</strong> Prøv forskjellige nivåer for å finne din stil
                                </Text>
                            </HStack>
                            <HStack>
                                <Icon as={CheckCircleIcon} color="green.500" />
                                <Text fontSize="sm">
                                    <strong>Legg til din touch:</strong> Personaliser med egne detaljer og erfaringer
                                </Text>
                            </HStack>
                            <HStack>
                                <Icon as={CheckCircleIcon} color="green.500" />
                                <Text fontSize="sm">
                                    <strong>Bruk som base:</strong> La AI gjøre grunnarbeidet, så finjuster selv
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>

                    <Divider />

                    {/* Pricing Comparison */}
                    <Box maxW="100vw" mx="auto" my={8}>
                        <Heading size="md" mb={4} color="purple.600" textAlign="center">
                            Pris
                        </Heading>
                        <Flex justifyContent="center" alignItems="center" w="100%">
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} maxW="800px" width="100%" p={{ base: 2, md: 6 }} alignItems="stretch">
                                {/* Empty column for centering */}
                                <Box display={{ base: 'none', md: 'block' }} />
                                {/* Column for "Our Service" */}
                                <VStack
                                    p={6}
                                    borderRadius="xl"
                                    border="2px solid"
                                    borderColor="purple.400"
                                    shadow="xl"
                                    spacing={4}
                                    transform="scale(1.05)"
                                >
                                    <Heading size="md" color="purple.600">Én betaling</Heading>
                                    <Divider />
                                    <VStack>
                                        <Text fontWeight="bold" fontSize="lg">49 kr</Text>
                                        <Text fontSize="sm" color="text-contrast-md" textAlign="center">for 50 søknadsbrev</Text>
                                    </VStack>
                                    <VStack>
                                        <Text fontWeight="bold" fontSize="lg">2-4 sekunder</Text>
                                        <Text fontSize="sm" color="text-contrast-md" textAlign="center">Leveringstid</Text>
                                    </VStack>
                                    <VStack>
                                        <Text fontWeight="bold" fontSize="lg">GPT-4o</Text>
                                        <Text fontSize="sm" color="text-contrast-md" textAlign="center">Høyeste AI-kvalitet</Text>
                                    </VStack>
                                </VStack>
                            </SimpleGrid>
                        </Flex>
                    </Box>
                    <Divider />

                    {/* AI Detection & Personalization Section */}
                    <Box maxW="800px" textAlign="center">
                        <Heading size="md" mb={6} color="purple.600">
                            100% menneskelig skriving + full personalisering
                        </Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                            {/* Human Score Visual */}
                            <VStack
                                p={6}
                                bg="bg-contrast-xs"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="border-contrast-sm"
                                _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                                transition="all 0.3s"
                            >
                                {/* Percentage Circle */}
                                <Box
                                    w="80px"
                                    h="80px"
                                    borderRadius="50%"
                                    border="6px solid"
                                    borderColor="green.400"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="green.50"
                                    position="relative"
                                    mb={3}
                                >
                                    <Text fontWeight="bold" fontSize="lg" color="green.800">100%</Text>
                                </Box>
                                <Text fontWeight="bold" fontSize="md">Menneskelig skriving</Text>
                                <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                    Passerer alle AI-deteksjonsverktøy
                                </Text>
                            </VStack>

                            {/* Personalization Visual */}
                            <VStack
                                p={6}
                                bg="bg-contrast-xs"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="border-contrast-sm"
                                _hover={{ bg: "bg-contrast-sm", transform: "translateY(-2px)" }}
                                transition="all 0.3s"
                            >
                                {/* Customization Icon */}
                                <Box
                                    w="80px"
                                    h="80px"
                                    borderRadius="50%"
                                    border="6px solid"
                                    borderColor="purple.400"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="purple.50"
                                    position="relative"
                                    mb={3}
                                >
                                    <Icon as={StarIcon} w={8} h={8} color="purple.500" />
                                </Box>
                                <Text fontWeight="bold" fontSize="md">Fullt personaliserbar</Text>
                                <Text fontSize="sm" color="text-contrast-md" textAlign="center">
                                    Tone, stil og innhold tilpasset dine behov
                                </Text>
                            </VStack>
                        </SimpleGrid>
                    </Box>

                    <Divider />
                    <Box maxW="800px">
                        <Heading size="md" mb={4} color="purple.600" textAlign="center">Ærlig og billig</Heading>
                        <VStack spacing={3} align="start">
                            <Text color="text-contrast-md" fontSize="md">
                                Ingen skjulte kostnader, ingen kompliserte abonnementer. Bare et kraftig verktøy til en rettferdig pris.
                            </Text>
                            <Text color="text-contrast-md" fontSize="md">
                                Her får du alt inkludert. Ingen dyre abonnementer med ulike nivåer basert på AI-modell, slik som mange andre tjenester. Slike "tiers" er unødvendig kompliserte og ofte ganske rovgriske.
                            </Text>

                            <Text color="text-contrast-md" fontSize="md" fontWeight="semibold" mt={2}>
                                Har du ikke råd?
                            </Text>
                            <Text color="text-contrast-md" fontSize="md">
                                Sjekk{" "}
                                <Link
                                    href="https://github.com/LienSimen/soknadgpt/blob/main/src/server/actions.ts"
                                    isExternal
                                    color="purple.600"
                                    textDecoration="underline"
                                    _hover={{
                                        color: "purple.800",
                                        textDecoration: "underline",
                                        textDecorationThickness: "2px"
                                    }}
                                    _focus={{
                                        outline: "2px solid",
                                        outlineColor: "purple.500",
                                        outlineOffset: "2px"
                                    }}
                                >
                                    GitHub-repoet
                                </Link>
                                {" "}hvor du kan bygge det helt selv. Koden skriver på det språket stillingsbeskrivelsen er på.
                            </Text>

                            <Text color="text-contrast-md" fontSize="md">
                                Du kan bruke{" "}
                                <Link
                                    href="https://gemini.google.com/"
                                    isExternal
                                    color="purple.600"
                                    textDecoration="underline"
                                    _hover={{
                                        color: "purple.800",
                                        textDecoration: "underline",
                                        textDecorationThickness: "2px"
                                    }}
                                    _focus={{
                                        outline: "2px solid",
                                        outlineColor: "purple.500",
                                        outlineOffset: "2px"
                                    }}
                                >
                                    Gemini
                                </Link>
                                {" "}eller{" "}
                                <Link
                                    href="https://chat.openai.com/"
                                    isExternal
                                    color="purple.600"
                                    textDecoration="underline"
                                    _hover={{
                                        color: "purple.800",
                                        textDecoration: "underline",
                                        textDecorationThickness: "2px"
                                    }}
                                    _focus={{
                                        outline: "2px solid",
                                        outlineColor: "purple.500",
                                        outlineOffset: "2px"
                                    }}
                                >
                                    ChatGPT
                                </Link>
                                {" "}som AI-motor.
                            </Text>

                            <Text color="text-contrast-md" fontSize="md">
                                For de som føler seg helt rå kan dere prøve{" "}
                                <Link
                                    href="https://github.com/google-gemini/gemini-cli"
                                    isExternal
                                    color="purple.600"
                                    textDecoration="underline"
                                    _hover={{
                                        color: "purple.800",
                                        textDecoration: "underline",
                                        textDecorationThickness: "2px"
                                    }}
                                    _focus={{
                                        outline: "2px solid",
                                        outlineColor: "purple.500",
                                        outlineOffset: "2px"
                                    }}
                                >
                                    Gemini CLI
                                </Link>
                                {" "}og få en personlig hjelper rett inn i <Link
                                    href="https://no.wikipedia.org/wiki/Kommandolinje"
                                    isExternal
                                    color="purple.600"
                                    textDecoration="underline"
                                    _hover={{
                                        color: "purple.800",
                                        textDecoration: "underline",
                                        textDecorationThickness: "2px"
                                    }}
                                    _focus={{
                                        outline: "2px solid",
                                        outlineColor: "purple.500",
                                        outlineOffset: "2px"
                                    }}
                                >
                                    terminalen
                                </Link> helt gratis. Det krever litt teknisk forståelse, men både Gemini og ChatGPT kan hjelpe med det!
                            </Text>
                        </VStack>
                    </Box>

                    <Divider />

                    {/* FAQ Section */}
                    <Box maxW="800px" w="full">
                        <Heading size="md" mb={6} color="purple.600" textAlign="center">
                            Ofte stilte spørsmål
                        </Heading>
                        <VStack spacing={6} align="stretch">
                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Hvor mange søknadsbrev får jeg for 49kr?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Du får 50 søknadsbrev for 49kr. Det er under 1 krone per søknadsbrev, som er betydelig billigere enn andre AI-tjenester eller å ansette noen til å skrive dem for deg.
                                </Text>
                            </Box>

                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Vil arbeidsgivere oppdage at dette er skrevet av AI?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Søknadsbrevene er optimalisert for å bestå AI-deteksjonstester og gir høy menneskelig score. Uredigert ChatGPT-tekst blir ofte avslørt, men disse brevene er tilpasset for å fremstå naturlige.
                                </Text>
                            </Box>

                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Hvilken AI-modell bruker dere?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Tjenesten bruker GPT-4o, som er OpenAI's mest avanserte modell. Alle brukere får tilgang til samme høykvalitets AI, uavhengig av prisplan.
                                </Text>
                            </Box>

                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Kan jeg redigere søknadsbrevene etter de er generert?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Ja! Søknadsbrevene kan redigeres, lagres og du kan til og med generere nye varianter av samme søknadsbrev. Du kan også justere kreativitetsnivået og inkludere spesielle ønsker.
                                </Text>
                            </Box>

                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Støtter dere andre språk enn norsk?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Ja! AI-en skriver søknadsbrevet på samme språk som stillingsbeskrivelsen. Hvis jobben er på engelsk, svensk eller et annet språk, vil søknadsbrevet også være på det språket.
                                </Text>
                            </Box>

                            <Box p={4} borderWidth={1} borderColor="border-contrast-sm" borderRadius="md">
                                <Text fontWeight="bold" mb={2} color="purple.600">
                                    Hvordan fungerer integrasjonen med Finn.no?
                                </Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Bare lim inn URL-en til jobbannonsen fra Finn.no, så hentes automatisk stillingstittel, firmanavn, lokasjon og jobbeskrivelse. Dette sparer tid og reduserer risikoen for skrivefeil.
                                </Text>
                            </Box>
                        </VStack>
                    </Box>

                    <Divider />

                    {/* How it works section */}
                    <Box maxW="800px" w="full">
                        <Heading size="md" mb={6} color="purple.600" textAlign="center">
                            Slik fungerer det
                        </Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            <VStack p={4} textAlign="center">
                                <Box
                                    w="60px"
                                    h="60px"
                                    borderRadius="50%"
                                    bg="purple.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={3}
                                >
                                    <Text fontWeight="bold" fontSize="xl" color="purple.600">1</Text>
                                </Box>
                                <Text fontWeight="bold" mb={2}>Lim inn jobbannonse</Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Kopier URL fra Finn.no eller skriv inn jobbdetaljene manuelt
                                </Text>
                            </VStack>

                            <VStack p={4} textAlign="center">
                                <Box
                                    w="60px"
                                    h="60px"
                                    borderRadius="50%"
                                    bg="purple.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={3}
                                >
                                    <Text fontWeight="bold" fontSize="xl" color="purple.600">2</Text>
                                </Box>
                                <Text fontWeight="bold" mb={2}>Last opp CV</Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Last opp din CV/resumé som PDF, DOC eller TXT
                                </Text>
                            </VStack>

                            <VStack p={4} textAlign="center">
                                <Box
                                    w="60px"
                                    h="60px"
                                    borderRadius="50%"
                                    bg="purple.100"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={3}
                                >
                                    <Text fontWeight="bold" fontSize="xl" color="purple.600">3</Text>
                                </Box>
                                <Text fontWeight="bold" mb={2}>Få søknadsbrev</Text>
                                <Text fontSize="sm" color="text-contrast-md">
                                    Motta et personlig søknadsbrev på få sekunder
                                </Text>
                            </VStack>
                        </SimpleGrid>
                    </Box>

                </VStack>
            </Container>
            <Box maxW="800px" mx="auto" my={12} textAlign="center">
                <Heading size="md" mb={4} color="purple.600">
                    Hvorfor bruke denne tjenesten fremfor ChatGPT?
                </Heading>
                <VStack spacing={3} align="start" mx="auto" maxW="600px">
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Billigere:</strong> 49kr for 50 søknadsbrev, langt rimeligere enn ChatGPT Plus.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Ingen abonnement:</strong> Én betaling, ingen skjulte kostnader eller månedlige forpliktelser.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Automatisk utfylling:</strong> Hent jobbinformasjon direkte fra Finn.no, spar tid og unngå feil.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Skreddersydd for søknadsbrev:</strong> Tilpasset jobbsøknader, ingen prompts nødvendig.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Passar AI-tester:</strong> Uredigert ChatGPT har 0% sjanse for å bestå AI-deteksjon.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Enkel redigering:</strong> Lagre, rediger og generer nye varianter med ett klikk.
                        </Text>
                    </HStack>
                    <HStack align="start">
                        <Icon as={CheckCircleIcon} color="purple.500" mt={1} />
                        <Text fontSize="sm">
                            <strong>Ingen teknisk kunnskap nødvendig:</strong> Alt skjer automatisk, ingen AI-kunnskap kreves.
                        </Text>
                    </HStack>
                </VStack>
            </Box>

            {/* Footer with internal links */}
            <Box mt={16} py={8} bg="gray.100" borderTop="1px solid" borderColor="gray.300">
                <Container maxW="container.lg">
                    <VStack spacing={6}>
                        <HStack spacing={8} flexWrap="wrap" justify="center">
                            <WaspLink to="/jobs" style={{ textDecoration: 'none' }}>
                                <Link
                                    color="purple.600"
                                    fontSize="sm"
                                    _hover={{ textDecoration: "underline" }}
                                    as="span"
                                >
                                    Mine jobber
                                </Link>
                            </WaspLink>
                            <WaspLink to="/profile" style={{ textDecoration: 'none' }}>
                                <Link
                                    color="purple.600"
                                    fontSize="sm"
                                    _hover={{ textDecoration: "underline" }}
                                    as="span"
                                >
                                    Min profil
                                </Link>
                            </WaspLink>
                            <WaspLink to="/tos" style={{ textDecoration: 'none' }}>
                                <Link
                                    color="purple.600"
                                    fontSize="sm"
                                    _hover={{ textDecoration: "underline" }}
                                    as="span"
                                >
                                    Vilkår og betingelser
                                </Link>
                            </WaspLink>
                            <WaspLink to="/privacy" style={{ textDecoration: 'none' }}>
                                <Link
                                    color="purple.600"
                                    fontSize="sm"
                                    _hover={{ textDecoration: "underline" }}
                                    as="span"
                                >
                                    Personvernpolicy
                                </Link>
                            </WaspLink>
                            <Link
                                href="https://www.finn.no/job"
                                isExternal
                                color="purple.600"
                                fontSize="sm"
                                _hover={{ textDecoration: "underline" }}
                            >
                                Finn.no jobber ↗
                            </Link>
                        </HStack>

                        <VStack spacing={2} textAlign="center">
                            <Text fontSize="sm" color="gray.700">
                                © 2025 SøknadGPT. Lag profesjonelle søknadsbrev med kunstig intelligens.
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                GPT-4o for høykvalitets AI-genererte søknadsbrev som passerer alle AI-deteksjonstester.
                            </Text>
                        </VStack>
                    </VStack>
                </Container>
            </Box>
        </>
    );
}
