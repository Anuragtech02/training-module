'use client';

import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useRef, useState } from 'react';
import generatePDF, { Margin, Resolution } from 'react-to-pdf';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { getCertificateData } from 'src/queries/certificates';
import Certificate from 'src/sections/certificate/certificate';

// ----------------------------------------------------------------------

// Helper to normalize certificate data from different sources
function normalizeCertificateData(certificateData, isUserCertificate, userData) {
  const attrs = certificateData?.attributes || {};

  if (isUserCertificate) {
    // Data from user-certificate API
    const course = attrs.course?.data?.attributes || {};
    const quizScore = attrs.quizScore?.data?.attributes || {};
    return {
      attributes: {
        courseTitle: course.title || 'Unknown Course',
        firstname: quizScore.firstname || userData?.firstname,
        lastname: quizScore.lastname || userData?.lastname,
        username: quizScore.username || userData?.username,
        createdAt: attrs.issuedDate,
        updatedAt: attrs.issuedDate,
      },
    };
  }

  // Legacy: Return as-is for quiz-score data
  return certificateData;
}

export default function ElearningCertificateDialog({
  open,
  handleClose,
  certificateData,
  userData,
  isUserCertificate = false,
}) {
  const targetRef = useRef();

  const { data: certificateNames } = useQuery('certificateNames', getCertificateData);

  const [isLoading, setIsLoading] = useState(false);

  const normalizedData = normalizeCertificateData(certificateData, isUserCertificate, userData);

  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true);

      const filename = `${normalizedData?.attributes?.username || userData?.username || 'User'}_${normalizedData?.attributes?.courseTitle || 'Certificate'}_Certificate.pdf`;

      await generatePDF(targetRef, {
        filename,
        method: 'download',
        resolution: Resolution.HIGH,
        format: 'letter',
        page: { orientation: 'landscape', margin: Margin.NONE },
        canvas: {
          mimeType: 'image/png',
          qualityRatio: 1,
        },
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <Stack>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{ position: 'fixed', top: 8, left: 26, zIndex: 999 }}
            >
              <CloseIcon />
            </IconButton>
            <LoadingButton
              autoFocus={false}
              loading={isLoading}
              sx={{
                position: 'fixed',
                bottom: 14,
                right: 40,
                zIndex: 999,
                cursor: 'pointer',
                borderRadius: '999px',
                backgroundColor: (theme) => `${theme.palette.error.main}30`,
                '&:hover': {
                  backgroundColor: (theme) => `${theme.palette.error.main}50`,
                },
              }}
              size="large"
              variant="contained"
              onClick={handleGeneratePDF}
              className={`${isLoading ? '' : 'animate-bounce'} hover:animate-none`}
            >
              {!isLoading && <FileDownloadIcon color="error" />}
            </LoadingButton>
          </Stack>
          <Stack ref={targetRef}>
            {certificateNames && (
              <Certificate
                certificateData={normalizedData}
                certificateNames={certificateNames.data.certificates.data[0].attributes.certificate}
                userData={userData}
              />
            )}
          </Stack>
        </Toolbar>
      </AppBar>
    </Dialog>
  );
}

ElearningCertificateDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  certificateData: PropTypes.object,
  userData: PropTypes.object,
  isUserCertificate: PropTypes.bool,
};
