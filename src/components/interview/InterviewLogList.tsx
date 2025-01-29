import { FileText, Calendar, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InterviewLog {
  id: string;
  candidateName: string;
  interviewer: string;
  date: string;
  type: string;
  sentiment?: "positive" | "negative" | "neutral";
}

const mockInterviews: InterviewLog[] = [
  {
    id: "1",
    candidateName: "Stanley",
    interviewer: "Abu",
    date: "2024-03-15",
    type: "Technical Interview",
    sentiment: "positive",
  },
  {
    id: "2",
    candidateName: "Daisuke",
    interviewer: "Abu",
    date: "2024-03-14",
    type: "HR Screening",
    sentiment: "neutral",
  },
  {
    id: "3",
    candidateName: "Lim HX",
    interviewer: "Abu",
    date: "2024-03-13",
    type: "Technical Interview",
    sentiment: "positive",
  },
];

interface InterviewLogListProps {
  searchQuery: string;
}

const InterviewLogList = ({ searchQuery }: InterviewLogListProps) => {
  const filteredInterviews = mockInterviews.filter(
    (interview) =>
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Interviewer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sentiment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInterviews.map((interview) => (
            <TableRow key={interview.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{interview.candidateName}</TableCell>
              <TableCell>{interview.interviewer}</TableCell>
              <TableCell>{interview.date}</TableCell>
              <TableCell>{interview.type}</TableCell>
              <TableCell>
                <span className={`inline-block w-2 h-2 rounded-full bg-${interview.sentiment === 'positive' ? 'green' : interview.sentiment === 'negative' ? 'red' : 'gray'}-500`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterviewLogList;
