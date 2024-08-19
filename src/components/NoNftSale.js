import { Box, Button, Image, Text, Stack } from "@chakra-ui/react";
import galleryImage from '../assests/gallery-image.jpg';
import { useNavigate } from "react-router-dom"; // useNavigate'i içe aktar

const NoNFTsView = () => {
    const navigate = useNavigate();

    return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          overflowX="hidden"
          width="100vw"
          sx={{
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
            overflowY: 'auto', // Dikey taşma için otomatik kaydırma    
          }}
        >
          <Stack spacing={4} align="center">
            <Image
              src={galleryImage}
              alt="No NFTs available"
              boxSize="300px"
              objectFit="cover"
               borderRadius="lg"
            />
            <Text fontSize="2xl" fontWeight="bold">No NFTs Yet</Text>
            <Text textAlign="center" fontSize="lg">
              There are currently no NFTs for sale. Do you want to list NFT?
            </Text>
            <Button
          colorScheme="teal"
          size="lg"
          onClick={() => navigate('/mynfts')} // Butona tıklandığında /mynfts'e yönlendir
        >
          My NFTs
        </Button>
          </Stack>
        </Box>
    );
};

export default NoNFTsView;
