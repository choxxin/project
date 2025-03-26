"use client";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas"; // Import html2canvas
import { FaRegCopy, FaCamera } from "react-icons/fa";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useEffect, useState } from "react";
import { LayoutList, Loader, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Description } from "@radix-ui/react-toast";

type callLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const router = useRouter();
  const [layout, setLayout] = useState<callLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const [currentUrl, setCurrentUrl] = useState("");
  const callingState = useCallCallingState();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  const geminiApiKey =
    process.env.GEMINI_API_KEY || "AIzaSyBl5lM6Md8_YbDt7o-rmB2SiIyppPT32dU"; // Default to an empty string if undefined
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Replace with your actual Gemini API key
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  // Function to send screenshot to the Hugging Face API
  const queryHuggingFace = async (data: Blob) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
          headers: {
            Authorization: "Bearer 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", // Replace with your Hugging Face token
          },
          method: "POST",
          body: data,
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error querying Hugging Face API:", error);
      return null;
    }
  };
  const checkReforestationPossibility = async (text: string) => {
    const prompt = `Determine if the following text indicates a need for reforestation. 
    If the text mentions deforestation, barren land, or lack of greenery "${text}"`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim(); // Expected to return "Yes" or "No"
  };

  const checkNSFWWithGemini = async (text: string) => {
    const prompt = `Determine if the following text contains  Any kind of material or garbage like bottle tell it is garbage. Yes or not "${text}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim(); // Expected to return "Yes" or "No"
  };
  //temp to store

  // Function to capture screenshot and process it
  const handleScreenshot = async () => {
    try {
      const element = document.body;
      const canvas = await html2canvas(element);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });

      if (!blob) {
        toast({ title: "Failed to capture screenshot." });
        return;
      }

      toast({ title: "Processing screenshot with Hugging Face API..." });

      // Step 1: Get text from the screenshot using Hugging Face API
      const huggingFaceResponse = await queryHuggingFace(blob);
      const tempText = huggingFaceResponse?.[0]?.generated_text;

      if (!tempText) {
        toast({ title: "Someone is looking at the screen" });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Small delay before toast
      toast({
        title: `Hugging Face Response: ${tempText}`,
        duration: 5000,
      });

      // Step 2: Wait for 5 seconds before sending text to Gemini API
      await new Promise((resolve) => setTimeout(resolve, 5000));
      toast({ title: "Sending text to Gemini API ..." });

      // Step 3: Check NSFW content with Gemini API
      const nsfwCheck = await checkNSFWWithGemini(tempText);

      if (nsfwCheck.toLowerCase() === "yes") {
        toast({
          title: "Garbage Detected",
          description:
            "Garbage detected in the screenshot. Sending response to NGOs...",
          variant: "destructive",
        });

        const garbageData = {
          location: "Phagwara",
          type: "Plastic",
          description: tempText,
        };

        try {
          const response = await fetch("/api/savegarbage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(garbageData),
          });

          const result = await response.json();
          if (response.ok) {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay before showing success message
            toast({
              title: "Saved Successfully",
              description: "Garbage details saved!",
            });
          } else {
            toast({
              title: "Failed to Save",
              description: result.error || "An error occurred.",
            });
          }
        } catch (error) {
          console.error("Error saving garbage:", error);
          toast({
            title: "Error",
            description: "Failed to connect to the database.",
          });
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay before next toast
        toast({
          title: "No garbage detected",
          description: "Everything looks clean!",
        });
      }

      // Step 4: Wait for 12 seconds before analyzing reforestation
      await new Promise((resolve) => setTimeout(resolve, 10000));
      toast({ title: "Analyzing environmental condition..." });

      const reforestationAnalysis = await checkReforestationPossibility(
        tempText
      );

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Small delay before next toast
      toast({
        title: "Reforestation Analysis",
        description: reforestationAnalysis,
        duration: 7000,
      });

      // Save reforestation data to MongoDB
      const reforestationData = {
        location: "Phagwara, Punjab",
        reforestation: reforestationAnalysis,
        garbage_collection: tempText,
      };

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay before saving data

      try {
        const response = await fetch("/api/create_eco_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reforestationData),
        });

        const result = await response.json();
        if (response.ok) {
          await new Promise((resolve) => setTimeout(resolve, 4000)); // Delay before showing success message
          toast({
            title: "Saved Successfully",
            description: "Reforestation details saved!",
          });
        } else {
          toast({
            title: "Failed to Save",
            description: result.error || "An error occurred.",
          });
        }
      } catch (error) {
        console.error("Error saving reforestation:", error);
        toast({
          title: "Error",
          description: "Failed to connect to the database.",
        });
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast({ title: "Error capturing screenshot." });
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "a") {
        handleScreenshot();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleScreenshot]);
  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="right" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[900px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn(
            "h-[calc(100vh-86px)]  ml-2 transition-transform duration-300",
            {
              block: showParticipants,
              hidden: !showParticipants,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls onLeave={() => router.push(`/`)} />
        <CallStatsButton />

        {/* Screenshot Button */}
        <button onClick={handleScreenshot}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <FaCamera size={20} className="text-white" />
          </div>
        </button>

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;
