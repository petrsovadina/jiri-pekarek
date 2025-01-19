import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const NewFileCard = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed">
      <CardContent className="flex items-center justify-center h-[200px]">
        <Button variant="ghost" className="h-20 w-20">
          <Plus className="h-10 w-10 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
};