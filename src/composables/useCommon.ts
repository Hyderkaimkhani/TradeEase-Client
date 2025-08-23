import { ref } from "vue";
import { apiService } from "../api/ApiService";
import { ApiResponse } from "../Interfaces/api.interface";
import { Fruit } from "../Interfaces/api.common";

export function useCommon() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const fruits = ref<{ label: string; value: number }[]>([]);

  const fetchFruits = async () => {
    loading.value = true;
    error.value = null;

    try {
      const url = `/api/Fruit`;
      const response = await apiService.get<ApiResponse<Fruit[]>>(url);

      if (response.isError) {
        error.value = response.message;
        return;
      }

      if (Array.isArray(response.model)) {
        fruits.value = response.model.map((fruit) => ({
          label: fruit.name,
          value: fruit.id,
        }));
      } else {
        fruits.value = [];
      }
    } catch (err: any) {
      error.value = err.message || "Failed to fetch data";
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fruits,
    fetchFruits,
  };
}
