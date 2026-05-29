import { useCallback } from 'react';
import axios from 'axios';

export const useCars = () => {
  const handleDeleteCar = useCallback(async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/cars/${id}`);
      // You could add logic here to trigger a re-fetch or state update
      console.log("Car deleted successfully");
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  }, []);

  return { handleDeleteCar };
};