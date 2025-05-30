import { Card, CardContent } from "@/components/ui/card";

export default function FoodCard() {
  return (
    <Card className="w-full max-w-md p-6 shadow-lg">
      <CardContent>
        <h3 className="text-xl font-bold mb-2">Food Item: Pizza</h3>
        <p>Calories: 280</p>
        <p>Proteins: 12g</p>
        <p>Carbs: 36g</p>
      </CardContent>
    </Card>
  );
}
