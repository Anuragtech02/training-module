'use client';

import { useEffect } from 'react';
import { m } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useCartStore } from 'src/states/cart';
import { RouterLink } from 'src/routes/components';
import { useUserStore } from 'src/states/auth-store';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function ElearningPurchaseCompletedView() {
  const { UserData } = useUserStore();

  const search = useSearchParams();
  const username = search.get('username');

  const emptyCart = useCartStore((state) => state.emptyCart);

  // Clear cart on successful purchase
  // Course enrollment is now handled by backend webhook
  useEffect(() => {
    if (username === UserData.username) {
      emptyCart();
    }
  }, [username, UserData.username, emptyCart]);

  return (
    <Container
      component={MotionContainer}
      sx={{
        textAlign: 'center',
        pt: { xs: 5, md: 10 },
        pb: { xs: 10, md: 20 },
      }}
    >
      <m.div variants={varBounce().in}>
        <Box sx={{ fontSize: 128 }}>🎉</Box>
      </m.div>

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Thank You for Your Purchase!</Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          Feel free to explore more courses and enhance your knowledge.
        </Typography>
      </Stack>

      <Button
        component={RouterLink}
        href={paths.eLearning.account.myLearning}
        size="large"
        color="inherit"
        variant="contained"
        startIcon={<Iconify icon="carbon:chevron-left" />}
      >
        My learning
      </Button>
    </Container>
  );
}
