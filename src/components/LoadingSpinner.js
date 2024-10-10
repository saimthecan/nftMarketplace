import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      
      minHeight="100vh"
      flexDirection="column"
      bg="gray.50"
        w="100vw"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
        mb={4}
      />
   
    </Box>
  );
};

export default LoadingSpinner;