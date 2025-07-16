import { Button, useColorMode } from '@chakra-ui/react';
import { FC } from 'react';
import { BsMoonStars, BsSun } from 'react-icons/bs';

const ThemeSwitch: FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button 
      mr='3' 
      border='1px' 
      borderColor='border-contrast-sm' 
      p='1' 
      size='xs'
      onClick={toggleColorMode}
      aria-label={colorMode === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      title={colorMode === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
    >
      {colorMode === 'dark' ? (
        <BsSun />
      ) : (
        <BsMoonStars />
      )}
    </Button>
  );
};

export default ThemeSwitch;
