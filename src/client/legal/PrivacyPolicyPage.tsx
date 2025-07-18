import BorderBox from "../components/BorderBox";
import { useEffect } from "react";
import LegalSection from "./components/legalSection";
import {
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <BorderBox>
      <VStack maxW="4xl" mx="auto" p={6} spacing={6} align="flex-start">
        <Heading as="h1" size="xl" mb={6}>
          Personvernerklæring
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={6}>
          Sist oppdatert: {new Date().toLocaleDateString()}
        </Text>

        <LegalSection title="1. Innledning">
          <Text>
            Lien Tech driver SøknadGPT, en fork fra
            https://github.com/vincanger/coverlettergpt. Denne siden informerer deg
            om våre retningslinjer for innsamling, bruk og deling av
            personopplysninger når du bruker vår tjeneste, samt hvilke valg du
            har knyttet til disse opplysningene.
          </Text>
        </LegalSection>

        <LegalSection title="2. Informasjon om behandlingsansvarlig">
          <Text>
            Behandlingsansvarlig for dine personopplysninger er:
            <br />
            <strong>Lien Tech</strong>
            <br />
            Organisasjonsnummer: 935820057
            <br />
            Kristofer Jansons Vei 63c
            <br />
            Bergen, Norge
            <br />
            Telefon: NO(+47) 45200242
            <br />
            E-post: Simen@cvcv.no
          </Text>
        </LegalSection>

        <LegalSection title="3. Dataene vi samler inn">
          <Text mb={4}>
            Vi samler inn ulike typer informasjon for forskjellige formål:
          </Text>
          <UnorderedList spacing={4}>
            <ListItem>
              <Text fontWeight="semibold">Kontodata:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>E-postadresse</ListItem>
                <ListItem>Navn</ListItem>
                <ListItem>Passord (kryptert)</ListItem>
                <ListItem>Profilinformasjon</ListItem>
                <ListItem>Kontoinnstillinger</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">Bruksdata:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>Tilgangstidspunkter og -datoer</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">Innholdsdata:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>CV-informasjon du oppgir</ListItem>
                <ListItem>Stillingsbeskrivelser du legger inn</ListItem>
                <ListItem>Genererte (eksempel) søknadsbrev</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">Betalingsdata:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>Betalingshistorikk</ListItem>
                <ListItem>Abonnementsstatus</ListItem>
                <ListItem>
                  Merk: Betalingsbehandling håndteres av Vipps eller Stripe
                </ListItem>
              </UnorderedList>
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="4. Hvordan vi bruker dine data">
          <UnorderedList spacing={4}>
            <ListItem>
              <Text fontWeight="semibold">For å levere vår tjeneste:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>Generere personlige søknadsbrev</ListItem>
                <ListItem>Administrere kontoen din</ListItem>
                <ListItem>Behandle betalingene dine</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">For å forbedre vår tjeneste:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>Analysere bruks mønstre</ListItem>
                <ListItem>Feilsøke tekniske problemer</ListItem>
                <ListItem>Forbedre brukeropplevelsen</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold">For å kommunisere med deg:</Text>
              <UnorderedList ml={6} mt={2} spacing={2}>
                <ListItem>Send tjenesteoppdateringer</ListItem>
                <ListItem>Svare på forespørslene dine</ListItem>
                <ListItem>Gi kundestøtte</ListItem>
              </UnorderedList>
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="5. Rettslig grunnlag for behandling">
          <UnorderedList spacing={4}>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                Kontraktsoppfyllelse:{" "}
              </Text>
              Behandling nødvendig for oppfyllelse av vår kontrakt med deg
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                Rettslige forpliktelser:{" "}
              </Text>
              Behandling nødvendig for å overholde rettslige forpliktelser
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                Berettigede interesser:{" "}
              </Text>
              Behandling basert på våre berettigede interesser i å forbedre og
              fremme våre tjenester
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                Samtykke:{" "}
              </Text>
              Behandling basert på ditt spesifikke samtykke der det er nødvendig
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="6. Databevaring">
          <Text mb={4}>
            Vi oppbevarer dine personopplysninger bare så lenge det er nødvendig
            for å oppfylle formålene vi samlet dem inn for, inkludert:
          </Text>
          <UnorderedList spacing={2}>
            <ListItem>Kontodata: Så lenge kontoen din er aktiv</ListItem>
            <ListItem>
              Generert innhold: Så lenge det er nødvendig for å levere våre
              tjenester eller til du sletter kontoen din
            </ListItem>
            <ListItem>
              Betalingsopplysninger: Som krevd av skatteregler (vanligvis 5 år i
              Norge)
            </ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="7. Dine rettigheter etter personvernloven">
          <Text mb={4}>I henhold til GDPR har du følgende rettigheter:</Text>
          <UnorderedList spacing={2} mb={4}>
            <ListItem>Rett til innsyn i dine personopplysninger</ListItem>
            <ListItem>Rett til retting av uriktige opplysninger</ListItem>
            <ListItem>Rett til sletting ("retten til å bli glemt")</ListItem>
            <ListItem>Rett til å begrense behandling</ListItem>
            <ListItem>Rett til dataportabilitet</ListItem>
            <ListItem>Rett til å protestere mot behandling</ListItem>
            <ListItem>Rett til å trekke tilbake samtykke</ListItem>
          </UnorderedList>
          <Text>
            For å utøve disse rettighetene, vennligst kontakt oss på
            Simen@cvcv.no
          </Text>
        </LegalSection>

        <LegalSection title="8. Datadeling og tredjeparter">
          <Text mb={4}>Vi deler dataene dine med følgende tredjeparter:</Text>
          <UnorderedList spacing={4} mb={4}>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                Vipps eller Stripe:{" "}
              </Text>
              For betalingsbehandling
            </ListItem>
            <ListItem>
              <Text fontWeight="semibold" as="span">
                OpenAI:{" "}
              </Text>
              For AI-drevet innholds generering
            </ListItem>
          </UnorderedList>
          <Text>
            Alle tredjeparter er kontraktsmessig forpliktet til å beskytte
            dataene dine og kan bare bruke dem til spesifiserte formål.
          </Text>
        </LegalSection>

        <LegalSection title="9. Internasjonale datatransfers">
          <Text mb={4}>
            Din data kan bli overført til og behandlet i land utenfor EU. Når
            dette skjer, sørger vi for at passende sikkerhetstiltak er på plass
            gjennom:
          </Text>
          <UnorderedList spacing={2}>
            <ListItem>EU-standard kontraktsbestemmelser</ListItem>
            <ListItem>
              Tilstrekkelighetsvurderinger fra Europakommisjonen
            </ListItem>
            <ListItem>Andre lovlig anerkjente overføringsmekanismer</ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="10. Informasjonskapsler og sporing">
          <Text mb={4}>
            Vår tjeneste bruker ikke informasjonskapsler eller
            sporingsteknologier. Vi prioriterer ditt personvern og har utformet
            vår tjeneste til å fungere uten behov for informasjonskapsler eller
            lignende sporingsmekanismer.
          </Text>
          <Text>
            All essensiell sesjonsadministrasjon håndteres sikkert gjennom
            standard autentisering tokens som automatisk blir slettet når du
            logger ut eller lukker nettleseren.
          </Text>
        </LegalSection>

        <LegalSection title="11. Databeskyttelse">
          <Text mb={4}>
            Vi implementerer passende tekniske og organisatoriske tiltak for å
            beskytte dine personopplysninger, inkludert:
          </Text>
          <UnorderedList spacing={2}>
            <ListItem>Regelmessige sikkerhetsvurderinger</ListItem>
            <ListItem>Tilgangskontroller og autentisering</ListItem>
            <ListItem>Regelmessige sikkerhetskopier</ListItem>
            <ListItem>Opplæring av ansatte om databeskyttelse</ListItem>
          </UnorderedList>
        </LegalSection>

        <LegalSection title="12. Endringer i denne personvernerklæringen">
          <Text mb={4}>
            Vi kan oppdatere vår personvernerklæring fra tid til annen. Vi vil
            varsle deg om eventuelle endringer ved å legge ut den nye
            personvernerklæringen på denne siden og oppdatere "Sist
            oppdatert"-datoen.
          </Text>
          <Text>
            Du anbefales å gjennomgå denne personvernerklæringen jevnlig for
            eventuelle endringer. Endringer i denne personvernerklæringen trer i
            kraft når de legges ut på denne siden.
          </Text>
        </LegalSection>

        <LegalSection title="13. Kontakt oss">
          <Text mb={4}>
            Hvis du har spørsmål om denne personvernerklæringen eller våre
            datapraksiser, vennligst kontakt oss:
          </Text>
          <UnorderedList spacing={2} mb={4}>
            <ListItem>Via e-post: Simen@cvcv.no</ListItem>
            <ListItem>
              Via post: Lien Tech, Kristofer Jansons Vei 63c, Bergen, Norge
            </ListItem>
          </UnorderedList>
          <Text>
            Du har rett til å klage til en tilsynsmyndighet hvis du mener vår
            behandling av dine personopplysninger krenker
            databeskyttelseslovgivningen.
          </Text>
        </LegalSection>
      </VStack>
    </BorderBox>
  );
};

export default PrivacyPolicy;
