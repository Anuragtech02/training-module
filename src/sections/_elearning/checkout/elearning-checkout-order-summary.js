/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useCartStore } from 'src/states/cart';
import { axiosClient } from 'src/utils/axiosClient';
import TextMaxLine from 'src/components/text-max-line';
import { fPercent, fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function ElearningCheckoutOrderSummary({
  setTaxAmount,
  taxPercent,
  total,
  subtotal,
  discount,
  courses,
  loading,
  isDelete,
  setCouponDiscountone,
  buttonLabel = 'Buy Now',
}) {
  const [coupon, setCoupon] = useState('');

  const [couponApply, setCouponApply] = useState(false);

  const [couponDiscountPercentage, setCouponDiscountPercentage] = useState('0');

  const [couponMessage, setCouponMessage] = useState('No coupon');

  const [taxedAmount, setTaxedAmount] = useState('');

  const [totalAmount, setTotalAmount] = useState(0);

  const getTaxAndCoupons = async () => {
    const response = await axiosClient.get('/api/configuration?populate=*');
    const { tax } = response.data.data.attributes;

    console.log(tax);

    const taxedAmountOne = (total * tax) / 100;
    setTaxedAmount(taxedAmountOne);
    setTaxAmount?.(taxedAmountOne);
    setTotalAmount(taxedAmountOne + total);
  };

  useEffect(() => {
    if (total) {
      getTaxAndCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const discountClick = async () => {
    const response = await axiosClient.get('/api/configuration?populate=*');
    const { coupons } = response.data.data.attributes;

    if (coupon === coupons.coupon && coupons.active) {
      setCouponDiscountPercentage(Math.round(totalAmount * (coupons.percentage / 100)));
      setCouponMessage('Coupon applied success');
      console.log(couponDiscountPercentage);
      setTotalAmount((prev) => prev - Math.round(totalAmount * (coupons.percentage / 100)));
      console.log(totalAmount);
      setCouponDiscountone?.(coupons.percentage);
      setCouponApply(true);
    } else {
      setCouponDiscountPercentage(0);
      setCouponMessage('Coupon not active');
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        p: 5,
        borderRadius: 2,
        border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
      }}
    >
      <Typography variant="h6"> Order Summary </Typography>

      {!!courses?.length && (
        <>
          {courses.map((course) => (
            <CourseItem key={courses.id} course={course} isDelete={isDelete} />
          ))}

          <Divider sx={{ borderStyle: 'dashed' }} />
        </>
      )}

      <Stack spacing={2}>
        <Row label="Subtotal" value={fCurrency(subtotal)} />

        <Row label={`${couponMessage}`} value={`-$${couponDiscountPercentage}`} />

        <Row label="Tax" value={`+ $${taxedAmount}`} />
      </Stack>

      <TextField
        onChange={(e) => setCoupon(e.target.value)}
        value={coupon}
        hiddenLabel
        placeholder="Discount Code"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button disabled={couponApply} onClick={() => discountClick()}>
                Apply
              </Button>
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Row
        label="Total"
        value={fCurrency(totalAmount)}
        sx={{
          typography: 'h6',
          '& span': { typography: 'h6' },
        }}
      />

      <LoadingButton
        size="large"
        variant="contained"
        color="inherit"
        type="submit"
        loading={loading}
      >
        {buttonLabel}
      </LoadingButton>
    </Stack>
  );
}

ElearningCheckoutOrderSummary.propTypes = {
  setTaxAmount: PropTypes.any,
  discount: PropTypes.number,
  loading: PropTypes.bool,
  courses: PropTypes.array,
  subtotal: PropTypes.number,
  taxPercent: PropTypes.number,
  total: PropTypes.number,
  isDelete: PropTypes.bool,
  setCouponDiscountone: PropTypes.any,
  buttonLabel: PropTypes.string,
};

// ----------------------------------------------------------------------

function CourseItem({ course, isDelete, ...other }) {
  const removeCourseFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <Stack direction="row" alignItems="flex-start" {...other}>
      <Image
        src={course?.attributes.image}
        sx={{
          mr: 2,
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      />

      <Stack flexGrow={1}>
        <Typography variant="body2" line={1} sx={{ fontWeight: 'fontWeightMedium' }}>
          {course?.attributes.title}
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 0.5, mb: 1.5 }}>
          {fCurrency(course?.attributes.price)}
        </Typography>
      </Stack>

      {isDelete && (
        <IconButton onClick={() => removeCourseFromCart(course)}>
          <Iconify icon="carbon:trash-can" />
        </IconButton>
      )}
    </Stack>
  );
}

CourseItem.propTypes = {
  course: PropTypes.shape({
    coverUrl: PropTypes.string,
    slug: PropTypes.string,
    price: PropTypes.number,
  }),
  isDelete: PropTypes.bool,
};

// ----------------------------------------------------------------------

function Row({ label, value, sx, ...other }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ typography: 'subtitle2', ...sx }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'body2' }}>
        {label}
      </Box>
      {value}
    </Stack>
  );
}

Row.propTypes = {
  label: PropTypes.string,
  sx: PropTypes.object,
  value: PropTypes.string,
};
