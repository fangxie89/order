import { useSnackbar } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message, severity = 'success') => {
    enqueueSnackbar(message, { 
      variant: severity,
      autoHideDuration: 3000
    });
  };

  return { showNotification };
}; 