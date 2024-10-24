"use client";

import { useEffect, useState } from "react";

import "@radix-ui/react-dialog";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import PublishCourseDialog from "./publish-course-dialog";

type PublishCourseProps = {
  triggerMsg: string;
  courseId: string;
  variant: ButtonProps["variant"];
};

type FieldMappings = {
  imageUrl: string;
  price: string;
  validity: string;
};

const PublishCourse = ({
  triggerMsg,
  variant,
  courseId,
}: PublishCourseProps) => {
  const [missingFields, setMissingFields] = useState<
    Array<keyof FieldMappings>
  >([]);

  const [invalidFields, setInvalidFields] = useState<
    Array<keyof FieldMappings>
  >([]);

  const [hasPublishedModule, setHasPublishedModule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublishStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/courses/${courseId}/publish-status`);
      const json = await res.json();

      console.log("res", res.status, json);
      if (res.status !== 200) {
        if (json.error.hasPublishedModule) {
          setHasPublishedModule(true);
        } else {
          setHasPublishedModule(false);
          // return;
        }
        setMissingFields(json.error.missingFields ?? []);
        setInvalidFields(json.error.invalidFields ?? []);
      } else {
        setHasPublishedModule(true);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishStatus();
  }, []);

  const missingorInvalidFieldMaps: FieldMappings = {
    imageUrl: "Image URL",
    price: "Price",
    validity: "Course Validity",
  };

  console.log("conf", hasPublishedModule &&
    missingFields.length === 0 &&
    invalidFields.length === 0 );

  return (
    <>
      {hasPublishedModule &&
      missingFields.length === 0 &&
      invalidFields.length === 0 ? (
        <PublishCourseDialog
          triggerMsg={triggerMsg}
          variant={variant}
          courseId={courseId}
          fetchPublishStatus={fetchPublishStatus}
        />
      ) : (
        <Dialog onOpenChange={(open) => open && fetchPublishStatus()}>
          <DialogTrigger asChild>
            <Button variant="app">Publish</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Publish Course</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              This course can&apos;t be published until all required fields are
              filled in.
            </DialogDescription>

            <div className="flex flex-col gap-2">
              {!hasPublishedModule && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  Course should have atleast one published module
                </div>
              )}
              {missingFields.length > 0 && (
                <div className="flex items-start gap-2">
                  {missingFields.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <p>Please fill in the following required fields:</p>
                        <ul className="mt-1 list-disc pl-5">
                          {missingFields.map((field) => (
                            <li key={field}>
                              {missingorInvalidFieldMaps[field] || field}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {invalidFields.length > 0 && (
                <div className="flex items-start gap-2">
                  {invalidFields.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <p>Following fields are invalid:</p>
                        <ul className="mt-1 list-disc pl-5">
                          {invalidFields.map((field) => (
                            <li key={field}>
                              {missingorInvalidFieldMaps[field] || field}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>

              <Button variant="app" disabled={true}>
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PublishCourse;
