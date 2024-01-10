// Pagination.js

import React from 'react';
import { Button, HStack } from '@chakra-ui/react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    pages.push(
      <Button
        key={p}
        onClick={() => onPageChange(p)}
        bg={currentPage === p ? 'blue.500' : 'white'}
        color={currentPage === p ? 'white' : 'gray.700'}
        _hover={{
          bg: 'gray.200',
        }}
        borderRadius="full"
        boxShadow="base"
        size="sm"
        isDisabled={currentPage === p}
      >
        {p}
      </Button>
    );
  }

  return (
    <HStack spacing={2}>
      <Button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        bg="white"
        color="gray.700"
        _hover={{
          bg: 'gray.200',
        }}
        borderRadius="full"
        boxShadow="base"
        size="sm"
        visibility={currentPage === 1 ? 'hidden' : 'visible'}
      >
        {'<'}
      </Button>

      {pages}

      <Button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        bg="white"
        color="gray.700"
        _hover={{
          bg: 'gray.200',
        }}
        borderRadius="full"
        boxShadow="base"
        size="sm"
        visibility={currentPage === totalPages ? 'hidden' : 'visible'}
      >
        {'>'}
      </Button>
    </HStack>
  );
};

export default Pagination;
