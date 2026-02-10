import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import ElearningCertificateDialog from 'src/sections/certificate/elearning-certificate-dialog';

// ----------------------------------------------------------------------

const certificateImages = [
  {
    courseTitle: '8 Hours Initial Administrator Training Program',
    image: '/assets/images/course/basics2.png',
  },
  {
    courseTitle: '16 Hours for New Administrators and Alternates',
    image: '/assets/images/course/basicsandbeyond2.png',
  },
  {
    courseTitle: '12 Hours for existing Administrators and Alternates',
    image: '/assets/images/course/advanced2.png',
  },
];

// Helper to get certificate data whether from user-certificate or quiz-score
function getCertificateInfo(certificateData, isUserCertificate) {
  const attrs = certificateData?.attributes || {};

  if (isUserCertificate) {
    // Data from user-certificate API (populated with course and quizScore)
    const course = attrs.course?.data?.attributes || {};
    const quizScore = attrs.quizScore?.data?.attributes || {};
    return {
      courseTitle: course.title || 'Unknown Course',
      score: quizScore.score || 'N/A',
      totalQuestions: quizScore.totalQuestions || 10,
      firstname: quizScore.firstname,
      lastname: quizScore.lastname,
      issuedDate: attrs.issuedDate,
      expiryDate: attrs.expiryDate,
      status: attrs.status,
    };
  }

  // Legacy: Data from quiz-score API
  return {
    courseTitle: attrs.courseTitle || 'Unknown Course',
    score: attrs.score || 'N/A',
    totalQuestions: attrs.totalQuestions || 10,
    firstname: attrs.firstname,
    lastname: attrs.lastname,
    issuedDate: null,
    expiryDate: null,
    status: 'active',
  };
}

function getStatusChip(status, expiryDate) {
  if (status === 'expired') {
    return (
      <Chip
        size="small"
        label="Expired"
        color="error"
        icon={<Iconify icon="carbon:warning" width={16} />}
        sx={{ mb: 1 }}
      />
    );
  }

  if (status === 'expiring_soon') {
    return (
      <Chip
        size="small"
        label="Expiring Soon"
        color="warning"
        icon={<Iconify icon="carbon:time" width={16} />}
        sx={{ mb: 1 }}
      />
    );
  }

  if (expiryDate) {
    return (
      <Chip
        size="small"
        label={`Valid until ${expiryDate}`}
        color="success"
        variant="outlined"
        sx={{ mb: 1 }}
      />
    );
  }

  return null;
}

export default function EcommerceAccountVoucherItem({
  certificateData,
  userData,
  isUserCertificate = false,
  isExpired = false,
}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const certInfo = getCertificateInfo(certificateData, isUserCertificate);

  const imageUrl = certificateImages
    .filter((data) => data.courseTitle === certInfo.courseTitle)
    .at(0)?.image;

  const hasName =
    (certInfo.firstname && certInfo.lastname) ||
    (userData?.firstname && userData?.lastname);

  return (
    <Stack
      direction="row"
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        border: (theme) => `solid 1px ${isExpired ? '#bdbdbd' : '#FF9470'}`,
        opacity: isExpired ? 0.7 : 1,
      }}
    >
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 120,
          height: 140,
          flexShrink: 0,
        }}
      >
        <Box sx={{ flexShrink: { sm: 0 }, pt: 1 }}>
          <Image
            alt="images"
            src={imageUrl}
            sx={{
              height: 1,
              objectFit: 'cover',
              width: 100,
              filter: isExpired ? 'grayscale(50%)' : 'none',
            }}
          />
        </Box>
      </Stack>

      <Stack sx={{ pl: 2.5, pr: 2.5, pb: 1, pt: 1, flex: 1 }}>
        <Typography variant="h6" sx={{ color: isExpired ? 'text.secondary' : '#FF774C' }}>
          {certInfo.courseTitle}
        </Typography>

        {getStatusChip(certInfo.status, certInfo.expiryDate)}

        <Typography variant="body2" sx={{ mb: 1 }}>
          Score: {certInfo.score}/{certInfo.totalQuestions}
        </Typography>

        <Button
          color={isExpired ? 'inherit' : 'primary'}
          size="large"
          variant="contained"
          onClick={() => handleClickOpen()}
          disabled={!hasName}
        >
          View
        </Button>

        {!hasName && (
          <Typography variant="caption" sx={{ mt: 1, color: 'error.main', fontStyle: 'italic' }}>
            Please update your profile with your first and last name to view the certificate.
          </Typography>
        )}

        <ElearningCertificateDialog
          open={open}
          handleClose={handleClose}
          certificateData={certificateData}
          userData={userData}
          isUserCertificate={isUserCertificate}
        />
      </Stack>
    </Stack>
  );
}

EcommerceAccountVoucherItem.propTypes = {
  certificateData: PropTypes.object,
  userData: PropTypes.object,
  isUserCertificate: PropTypes.bool,
  isExpired: PropTypes.bool,
};
