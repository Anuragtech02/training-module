'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { paths } from 'src/routes/paths';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { axiosClient } from 'src/utils/axiosClient';
import { useUserStore } from 'src/states/auth-store';

import EcommerceAccountVoucherItem from '../account/ecommerce-account-voucher-item';

// ----------------------------------------------------------------------

export default function EcommerceAccountVouchersView() {
  const userData = useUserStore((state) => state.UserData);

  const [certificates, setCertificates] = useState([]);
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!userData?.id) return;

      try {
        const response = await axiosClient.get(
          `/api/user-certificates?filters[user][id][$eq]=${userData.id}&populate=course,quizScore`
        );
        setCertificates(response?.data?.data || []);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
    fetchCertificates();
  }, [userData?.id]);

  // Separate active and expired certificates
  const activeCertificates = certificates.filter(
    (cert) => cert.attributes.status !== 'expired'
  );
  const expiredCertificates = certificates.filter(
    (cert) => cert.attributes.status === 'expired'
  );

  const hasAnyCertificates = certificates.length > 0;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Certificates
      </Typography>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      {/* Active Certificates */}
      <Box>
        {activeCertificates.length > 0 ? (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, color: 'success.main' }}>
              Active Certificates ({activeCertificates.length})
            </Typography>
            {activeCertificates.map((cert) => (
              <Box
                key={cert.id}
                gap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
                sx={{ mb: 2 }}
              >
                <EcommerceAccountVoucherItem
                  certificateData={cert}
                  userData={userData}
                  isUserCertificate
                />
              </Box>
            ))}
          </>
        ) : hasAnyCertificates ? (
          // Has expired certificates but no active ones
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            No active certificates. Check expired certificates below to renew.
          </Typography>
        ) : (
          // No certificates at all
          <Box>
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                ml: { md: -2 },
                mt: { xs: 12, md: 4 },
              }}
            >
              <Image
                alt="Empty State My Learning"
                src="/assets/images/empty-states/no-wishlist.png"
                sx={{
                  height: { xs: 122, md: 182 },
                  width: { xs: 160, md: 220 },
                  objectFit: 'cover',
                }}
              />

              <Link component={RouterLink} href={paths.eLearning.courses} sx={{ pt: 10 }}>
                <Button
                  color="secondary"
                  size="large"
                  variant="contained"
                  startIcon={<Iconify icon="carbon:chevron-left" />}
                >
                  Start Learning
                </Button>
              </Link>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Expired Certificates Section */}
      {expiredCertificates.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

          <Accordion
            expanded={showExpired}
            onChange={() => setShowExpired(!showExpired)}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 0 }}
            >
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Expired Certificates ({expiredCertificates.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              {expiredCertificates.map((cert) => (
                <Box
                  key={cert.id}
                  gap={3}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    md: 'repeat(2, 1fr)',
                  }}
                  sx={{ mb: 2 }}
                >
                  <EcommerceAccountVoucherItem
                    certificateData={cert}
                    userData={userData}
                    isUserCertificate
                    isExpired
                  />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </>
  );
}
