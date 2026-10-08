"use client";

import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

export default function EmptyProducts() {
  const handleHomeClick = () => {
    window.location.href = "/";
  };

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-6"
      )}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Tag className="h-16 w-16 text-primary/80" />
          </EmptyMedia>

          <EmptyTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-blue-500 bg-clip-text text-transparent">
            No products found
          </EmptyTitle>

          <EmptyDescription className="text-muted-foreground text-base max-w-md mx-auto">
           No products match your search criteria.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={handleHomeClick}
              className="btn-default group"
            >
              <Tag className="h-4 w-4 mr-2 transition-transform group-hover:rotate-6" />
              Browse products
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
