import BorderBox from "../components/BorderBox";
import { useEffect } from "react";
import LegalSection from "./components/legalSection";
import {
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
  Link,
  Box,
} from "@chakra-ui/react";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <BorderBox>
      <VStack maxW="4xl" mx="auto" p={6} spacing={6} align="flex-start">
        <Heading as="h1" size="xl" mb={6}>
          Vilkår for bruk
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={6}>
          Sist oppdatert: {new Date().toLocaleDateString("nb-NO")}
        </Text>

        <LegalSection title="1. Firmaopplysninger (Impressum)">
          <Text>
            <strong>Navn på organisasjon:</strong> Lien Tech
            <br />
            <strong>Organisasjonsnummer:</strong> 935820057
            <br />
            <strong>Adresse:</strong> Kristofer Jansons Vei 63c
            <br />
            Bergen, Norge
            <br />
            <strong>Telefonnummer:</strong> NO(+47) 45200242
            <br />
            <strong>E-post:</strong> Simen@cvcv.no
          </Text>
        </LegalSection>

        <LegalSection title="2. Tjenestebeskrivelse og produkter">
          <Text mb={4}>
            SøknadGPT er en SaaS-applikasjon som bruker AI-teknologi for å
            hjelpe brukere med å lage personlige eksempler på søknadsbrev basert
            på CV og stillingsbeskrivelser. Tjenesten tilbys fra Norge og er
            underlagt norsk lov.
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Våre produkter og tjenester:
          </Text>
            <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              <Text fontWeight="semibold">
              Månedlig abonnement:
              </Text>
              <Text>
              Ubegrenset bruk* av AI-genererte søknadsbrev.
              </Text>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">Kredittbasert engangsbruk:</Text>
              <Text>
              Kjøp kreditter og bruk dem til å generere søknadsbrev etter behov.
              </Text>
            </ListItem>
            </UnorderedList>
            <Text fontSize="xs" color="gray.500" mb={2}>
            *Ubegrenset bruk gjelder for normal, rimelig og personlig bruk. Vi forbeholder oss retten til å begrense, suspendere eller avslutte tilgangen til tjenesten ved unormalt høy bruk, automatisert bruk, misbruk eller annen aktivitet som anses som urimelig eller i strid med tjenestens formål.
            </Text>

          <Text fontSize="sm" color="gray.600">
            Alle priser er oppgitt i norske kroner (NOK) og inkluderer
            merverdiavgift (MVA) der det er påkrevd.
          </Text>
        </LegalSection>

        <LegalSection title="3. Parter og avtalens inngåelse">
          <Text mb={4}>
            <strong>Selger:</strong> Lien Tech, organisasjonsnummer 935820057,
            Bergen, Norge
          </Text>
          <Text mb={4}>
            <strong>Kjøper:</strong> Den person som registrerer seg og
            aksepterer disse vilkårene
          </Text>
          <Text>
            Ved å registrere deg for vår tjeneste inngår du en juridisk bindende
            avtale med Lien Tech etter norsk lov. Avtalen anses inngått når vi
            bekrefter din registrering via e-post eller når du gjennomfører en
            betaling.
          </Text>
        </LegalSection>

        <LegalSection title="4. Brukerkonto og personvern">
          <Text>
            For å bruke SøknadGPT må du registrere en konto og oppgi korrekt og
            fullstendig informasjon. Du er selv ansvarlig for å holde
            kontoinformasjon og passord konfidensielt.
          </Text>
        </LegalSection>

        <LegalSection title="5. Betaling og betalingsvilkår">
          <Text mb={4}>
            Alle betalinger behandles sikkert gjennom Vipps, en godkjent norsk
            betalingsløsning. Vi lagrer ikke betalingsopplysninger på våre
            servere.
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Betalingsalternativer:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              Månedlig abonnement via Vipps (Vipps-app eller bankkort)
            </ListItem>
            <ListItem>
              Månedlig abonnement via Stripe (bankkort, Apple Pay, Google Pay)
            </ListItem>
            <ListItem>
              Engangsbetaling via Vipps (Vipps-app eller bankkort)
            </ListItem>
            <ListItem>
              Engangsbetaling via Stripe (bankkort, Apple Pay, Google Pay)
            </ListItem>
            <ListItem>
              Engangsbetaling via Lightning (Bitcoin)
            </ListItem>
          </UnorderedList>

          <Text fontWeight="semibold" mb={2}>
            Betalingsbetingelser:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              Månedlige abonnementer faktureres månedlig på forhånd
            </ListItem>
            <ListItem>
              Abonnementet fornyes automatisk hver måned med mindre det sies opp
              minst én dag før fornyelsesdatoen
            </ListItem>
            <ListItem>
              Priser inkluderer merverdiavgift (MVA) der det er påkrevd
            </ListItem>
            <ListItem>
              Engangsbetalinger krever betaling før bruk av tjenesten
            </ListItem>
          </UnorderedList>

          <Text fontSize="sm" color="gray.600">
            Ved betalingsproblemer eller spørsmål om fakturering, kontakt oss på
            Simen@cvcv.no
          </Text>
        </LegalSection>

        <LegalSection title="6. Angrerett og forbruk av digitale tjenester">
          <VStack spacing={6} align="stretch">
            <Box>
              <Text>
                Som forbruker har du i utgangspunktet rett til å angre denne
                avtalen innen 14 dager uten å oppgi noen grunn. Angrefristen
                utløper 14 dager etter avtaleinngåelse.
              </Text>

              <Text mt={4} fontWeight="semibold" color="orange.600">
                VIKTIG - Tap av angrerett for digitale tjenester:
              </Text>

              <Text mt={2}>
                Ved å bruke SøknadGPT (f.eks. generere søknadsbrev, bruke
                AI-funksjoner) samtykker du eksplisitt til at vi starter
                leveringen av den digitale tjenesten før angrefristen på 14
                dager er utløpt. Du erkjenner og aksepterer at du dermed mister
                din angrerett i henhold til angrerettsloven § 18 bokstav m.
              </Text>

              <Text mt={4}>Dette gjelder for:</Text>
              <UnorderedList mt={2} spacing={2} pl={5}>
                <ListItem>
                  Abonnementer hvor du starter å bruke tjenesten
                </ListItem>
                <ListItem>
                  Engangsbetalinger hvor du umiddelbart genererer søknadsbrev
                </ListItem>
              </UnorderedList>

              <Text mt={4}>
                <strong>Unntak:</strong> Hvis du ikke har brukt tjenesten i det
                hele tatt innen 14 dager, kan du fortsatt benytte angreretten.
              </Text>

              <Text mt={4}>
                For å benytte angreretten (kun hvis du ikke har brukt tjenesten)
                må du gi oss beskjed via e-post til Simen@cvcv.no før fristen
                utløper.
              </Text>
            </Box>

            <Box
              p={4}
              borderWidth={1}
              borderRadius="lg"
              bg="yellow.50"
              borderColor="yellow.200"
            >
              <Text fontWeight="semibold" mb={2} color="yellow.800">
                Refusjonspolicy for abonnementer
              </Text>
              <Text color="yellow.700">
                Selv om angreretten bortfaller ved bruk, kan vi i spesielle
                tilfeller vurdere refusjon for abonnementer som kanselleres
                tidlig. Kontakt oss på Simen@cvcv.no for å diskutere din
                situasjon.
              </Text>
            </Box>
          </VStack>
        </LegalSection>

        <LegalSection title="7. Levering av tjenesten">
          <Text mb={4}>
            SøknadGPT er en digital tjeneste som leveres umiddelbart ved
            registrering og betaling. Det er ingen fysisk levering.
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Leveringstidspunkt:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              Abonnementer: Tilgang aktiveres umiddelbart etter vellykket
              betaling
            </ListItem>
            <ListItem>
              Engangsbetalinger: Tilgang til å generere søknadsbrev aktiveres
              umiddelbart
            </ListItem>
          </UnorderedList>

          <Text>
            Eventuelle tekniske problemer som hindrer tilgang til tjenesten vil
            bli løst så raskt som mulig. Kontakt oss på Simen@cvcv.no hvis du
            opplever problemer med tilgang.
          </Text>
        </LegalSection>

        <LegalSection title="8. Retur og refusjon">
          <Text mb={4}>
            Som en digital tjeneste har SøknadGPT ikke tradisjonell "retur" som
            fysiske produkter. Refusjon håndteres som følger:
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Refusjonsbetingelser:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              <strong>Abonnementer:</strong> Ingen automatisk refusjon, men vi
              kan vurdere refusjon ved spesielle omstendigheter
            </ListItem>
            <ListItem>
              <strong>Engangsbetalinger:</strong> Ingen refusjon etter at
              tjenesten er brukt (søknadsbrev generert)
            </ListItem>
            <ListItem>
              <strong>Tekniske problemer:</strong> Full refusjon hvis vi ikke
              kan levere tjenesten som avtalt
            </ListItem>
            <ListItem>
              <strong>Ubrukt angrerett:</strong> Full refusjon hvis angreretten
              utøves før tjenesten brukes
            </ListItem>
          </UnorderedList>

          <Text>
            Refusjoner behandles innen 14 dager og returneres via samme
            betalingsmåte som ble brukt ved kjøp.
          </Text>
        </LegalSection>

        <LegalSection title="9. Reklamasjonshåndtering og kundeservice">
          <Text mb={4}>
            Vi tar kundetilfredshet på alvor og håndterer alle henvendelser
            profesjonelt og raskt.
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Reklamasjonsprosess:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              <strong>Kontakt:</strong> Send reklamasjon til Simen@cvcv.no med
              detaljert beskrivelse av problemet
            </ListItem>
            <ListItem>
              <strong>Responstid:</strong> Vi svarer innen 48 timer på hverdager
            </ListItem>
            <ListItem>
              <strong>Undersøkelse:</strong> Vi undersøker saken og kommer
              tilbake med forslag til løsning
            </ListItem>
            <ListItem>
              <strong>Oppfølging:</strong> Vi følger opp til problemet er løst
            </ListItem>
          </UnorderedList>

          <Text fontWeight="semibold" mb={2}>
            Vanlige reklamasjonsgrunner:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>Tekniske problemer med tjenesten</ListItem>
            <ListItem>Faktureringsfeil</ListItem>
            <ListItem>Problemer med konto eller tilgang</ListItem>
          </UnorderedList>

          <Text fontSize="sm" color="gray.600">
            Du har rett til å klage til Forbrukertilsynet hvis du ikke er
            fornøyd med vår håndtering av reklamasjonen.
          </Text>
        </LegalSection>

        <LegalSection title="10. Abonnement - bindingstid, oppsigelse og endring">
          <Text mb={4}>
            Informasjon om ditt abonnement og hvordan du administrerer det:
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Bindingstid:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              <strong>Månedlige abonnementer:</strong> Ingen bindingstid - kan
              sies opp når som helst
            </ListItem>
            <ListItem>
              <strong>Engangsbetalinger:</strong> Ingen abonnement - betaling
              gjelder kun for den ene bruken
            </ListItem>
          </UnorderedList>

          <Text fontWeight="semibold" mb={2}>
            Oppsigelse av abonnement:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              Du kan si opp abonnementet når som helst via din brukerkonto eller
              ved å kontakte oss på Simen@cvcv.no
            </ListItem>
            <ListItem>
              Oppsigelse må skje minst én dag før neste faktureringsdato for å
              unngå ny belastning
            </ListItem>
            <ListItem>
              Ved oppsigelse har du tilgang til tjenesten frem til utløpet av
              gjeldende betalingsperiode
            </ListItem>
          </UnorderedList>

        </LegalSection>

        <LegalSection title="11. Konfliktløsning">
          <Text mb={4}>
            Vi streber etter å løse alle konflikter på en vennskapelig måte
            gjennom direkte kommunikasjon.
          </Text>

          <Text fontWeight="semibold" mb={2}>
            Trinn for konfliktløsning:
          </Text>
          <UnorderedList spacing={2} pl={5} mb={4}>
            <ListItem>
              <strong>Direkte kontakt:</strong> Kontakt oss først på
              Simen@cvcv.no for å diskutere problemet
            </ListItem>
            <ListItem>
              <strong>Forbrukertilsynet:</strong> Du kan kontakte
              Forbrukertilsynet for rådgivning og bistand
            </ListItem>
            <ListItem>
              <strong>Forbrukerrådet:</strong> Gratis rådgivning tilgjengelig på
              forbrukerradet.no
            </ListItem>
            <ListItem>
              <strong>Tvisteløsning:</strong> For EU-borgere er EU-kommisjonens
              online tvisteløsningsplattform tilgjengelig på
              https://ec.europa.eu/consumers/odr/
            </ListItem>
          </UnorderedList>

          <Text fontWeight="semibold" mb={2}>
            Lovvalg og verneting:
          </Text>
          <Text>
            Denne avtalen er underlagt norsk lov. Tvister løses ved norske
            domstoler, med Bergen tingrett som verneting.
          </Text>
        </LegalSection>

        <LegalSection title="12. Bruk av tjenesten og begrensninger">
          <Text>
            SøknadGPT tilbyr AI-genererte søknadsbrev. Brukere erkjenner og
            godtar følgende vilkår:
          </Text>
          <UnorderedList spacing={2} pl={5}>
            <ListItem>
              Tjenesten er kun ment for eksempler og læring. Søknadsbrev
              generert via tjenesten er ment som maler og eksempler.
            </ListItem>
            <ListItem>
              Brukere anbefales STERKT å ikke bruke AI-genererte søknadsbrev
              direkte i jobbsøknader uten betydelig personlig tilpasning og
              gjennomgang.
            </ListItem>
            <ListItem>
              Vi forbeholder oss retten til å begrense, suspendere eller
              avslutte tilgangen til tjenesten ved misbruk eller brudd på
              vilkårene.
            </ListItem>
            <ListItem>
              Brukere er ansvarlige for å holde kontoinformasjon konfidensiell
              og kan ikke dele kontoen med andre.
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="13. Ansvarsfraskrivelse">
          <Text>I den grad loven tillater det:</Text>
          <UnorderedList spacing={2} pl={5}>
            <ListItem>
              Søknadsbrev generert via tjenesten leveres "SOM DE ER" og "SOM
              TILGJENGELIG" uten noen garantier, verken uttrykte eller
              underforståtte.
            </ListItem>
            <ListItem>
              Vi fraskriver oss ethvert ansvar for innhold, nøyaktighet eller
              egnethet av genererte søknadsbrev til noe bestemt formål,
              inkludert jobbsøknader.
            </ListItem>
            <ListItem>
              Brukeren har fullt ansvar for bruk, endring eller innsending av
              genererte søknadsbrev i jobbsøknader eller andre profesjonelle
              sammenhenger.
            </ListItem>
            <ListItem>
              Vi er ikke ansvarlige for noen konsekvenser, direkte eller
              indirekte, som følge av bruk av tjenesten, inkludert men ikke
              begrenset til:
              <UnorderedList mt={2} pl={5}>
                <ListItem>Tapte jobbmuligheter</ListItem>
                <ListItem>Avslåtte søknader</ListItem>
                <ListItem>Innvirkning på profesjonelt omdømme</ListItem>
                <ListItem>Tap av potensiell inntekt</ListItem>
                <ListItem>
                  Feil eller misvisende innhold i genererte brev
                </ListItem>
                <ListItem>Tekniske feil eller tjenesteavbrudd</ListItem>
                <ListItem>Tap av data eller sikkerhetsbrudd</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              Selv om vi tilstreber høy kvalitet, kan AI-generert innhold
              inneholde feil, inkonsekvenser eller upassende innhold. Brukere
              anbefales å grundig gjennomgå og tilpasse alt generert innhold før
              bruk.
            </ListItem>
            <ListItem>
              Vi garanterer ikke at tjenesten vil oppfylle dine spesifikke krav
              eller forventninger, eller at den er kompatibel med dine behov for
              jobbsøknader.
            </ListItem>
            <ListItem>
              Vårt totale ansvar, hvis noe, skal ikke overstige det beløpet du
              har betalt for tjenesten måneden før hendelsen.
            </ListItem>
            <ListItem>
              Enkelte jurisdiksjoner tillater ikke utelukkelse av visse
              garantier eller begrensninger på lovfestede rettigheter, så noen
              av de ovennevnte begrensningene kan ikke gjelde for deg.
            </ListItem>
          </UnorderedList>
          <Text mt={4} fontWeight="semibold">
            Ved å bruke tjenesten erkjenner og aksepterer du eksplisitt disse
            begrensningene og ansvarsfraskrivelsene.
          </Text>
        </LegalSection>

        <LegalSection title='16. Ansvarsfraskrivelse og selv beskyttelse"'>
          <Text mb={4}>
            Denne tjenesten tilbys av en privatperson og er open source. Ved å
            bruke tjenesten aksepterer du at du ikke vil saksøke meg for
            småfeil, tekniske problemer eller andre bagateller. Tjenesten
            leveres uten garanti, og bruk skjer på eget ansvar. Eventuelle krav
            om erstatning utover det som følger av ufravikelig norsk lov
            frafalles. Jeg er selvfølgelig lett å snakke med om det er noe som
            du føler var feil, da er det bare å sende mail! Dette er bare for å
            beskytte meg selv mot internett haier.
          </Text>
        </LegalSection>

        <LegalSection title="17. Immaterielle rettigheter">
          <UnorderedList spacing={2} pl={5}>
            <ListItem>
              Kildekoden og programvaren er åpen kildekode (GPLv3). Du kan
              bruke, endre og distribuere koden så lenge du følger
              lisensvilkårene.
            </ListItem>
            <ListItem>
              Du beholder rettighetene til din egen informasjon og dine
              redigerte søknadsbrev.
            </ListItem>
            <ListItem>
              Tjenesten og dens innhold kan ikke kommersialiseres uten
              eksplisitt skriftlig tillatelse.
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="18. Sikkerhet">
          <Text>
            SøknadGPT behandler ikke betalinger direkte på nettsiden. Alle
            betalinger behandles sikkert gjennom Vipps eller Stripe, en godkjent norsk
            betalingsleverandør. Ved betaling:
          </Text>
          <UnorderedList spacing={2} pl={5}>
            <ListItem>
              Dine betalingsopplysninger lagres aldri på våre servere
            </ListItem>
            <ListItem>
              Alle betalingstransaksjoner er kryptert og behandles sikkert av
              Vipps eller Stripe
            </ListItem>
            <ListItem>
              Vipps er regulert av Finanstilsynet og følger strenge
              sikkerhetsstandarder for betalingsbehandling.
              Stripe er en PCI Service Provider Level 1, som er det høyeste nivået for
              sikkerhet ved betalingsbehandling.
            </ListItem>
            <ListItem>
              For mer informasjon om Vipps' sikkerhet, se
              <Link
                href="https://vipps.no/sikkerhet/"
                target="_blank"
                rel="noopener noreferrer"
                color="purple.600"
                _hover={{ color: "purple.800" }}
                ml={1}
              >
                Vipps' sikkerhetsdokumentasjon
              </Link>
            </ListItem>
            <ListItem>
              For mer informasjon om Stripes sikkerhet, se
              <Link
              href="https://stripe.com/docs/security"
              target="_blank"
              rel="noopener noreferrer"
              color="purple.600"
              _hover={{ color: "purple.800" }}
              ml={1}
              >
              Stripes sikkerhetsdokumentasjon
              </Link>
            </ListItem>
          </UnorderedList>
        </LegalSection>
      </VStack>
    </BorderBox>
  );
};

export default TermsOfService;
