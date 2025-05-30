import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DetectionForm() {
  return (
    <div className="fixed top-20 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 md:p-8">
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-sm">
      <Input type="file" className="mb-4 w-full" />
      <Button className="w-full">Detect</Button>
    </div>
    </div>
  );
}
