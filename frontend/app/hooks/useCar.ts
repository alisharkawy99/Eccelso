import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';

export const useCars = () => {
  const [isDeleting,setIsDeleting]=useState(false);
  const handleDeleteCar = useCallback(async (id: string) => {
    setIsDeleting(true)
    try {
      await apiClient.delete(`/cars/${id}`);
      // You could add logic here to trigger a re-fetch or state update
      console.log("Car deleted successfully");
    } catch (error) {
      console.error("Error deleting car:", error);
    }
    setIsDeleting(false)
  }, []);

  return { handleDeleteCar,isDeleting };
};