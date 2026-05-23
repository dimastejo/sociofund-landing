import apiClient from "@/lib/apiClient.js";

export async function getPageSections(page) {
  const { data } = await apiClient.get("/v1/public/socio/cms/page-sections", {
    params: { page },
  });

  return data;
}
