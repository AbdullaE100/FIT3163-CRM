import { useState } from "react";
import { Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CreateInterviewLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateInterviewLogDialog = ({ open, onOpenChange }: CreateInterviewLogDialogProps) => {
  const [formData, setFormData] = useState({
    candidateName: "",
    interviewer: "",
    date: "",
    type: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Interview Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              value={formData.candidateName}
              onChange={(e) =>
                setFormData({ ...formData, candidateName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interviewer">Interviewer</Label>
            <Input
              id="interviewer"
              value={formData.interviewer}
              onChange={(e) =>
                setFormData({ ...formData, interviewer: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Interview Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Interview Type</Label>
            <Input
              id="type"
              placeholder="e.g., Technical Interview, HR Screening"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter interview notes or key takeaways..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-32"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Log</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInterviewLogDialog;