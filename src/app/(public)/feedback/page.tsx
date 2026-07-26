import { FeedbackForm } from "./feedback-form";
import { getProducts } from "@/lib/data";

export const metadata = {
  title: "Leave Feedback",
  description: "Share your experience with QAAQ premium dry fruits",
};

export default async function FeedbackPage() {
  const products = await getProducts();
  return (
    <FeedbackForm products={products} />
  );
}
