import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ArrowLeft,
  Calendar,
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { useAssignmentDetailForStudent } from "../../hooks/useAssignment";
import { useSubmissionByAssignment, useSubmitSubmission } from "../../hooks/useSubmission";
import { Answer } from "../../lib/assignmentService";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

/**
 * AssignmentDetail.tsx
 * - Sửa để tương thích với ReponseDetailSubmissionDTO mới (FE side normalization)
 * - An toàn với null/undefined
 * - Không dùng các trường cũ (question.correct, answerData.correct, ...)
 */

export function AssignmentDetail() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  // State để lưu đáp án đã chọn (key là questionId)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: Answer }>({});

  // ===========================
  // API CALLS
  // ===========================

  // Lấy chi tiết assignment
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    isError: isErrorAssignment,
    error: errorAssignment,
  } = useAssignmentDetailForStudent(assignmentId ? parseInt(assignmentId) : 0, !!assignmentId);

  // Kiểm tra xem đã nộp bài chưa
  // NOTE: useSubmissionByAssignment đã được chuẩn hoá để trả ReponseDetailSubmissionDTO với:
  // - grade: number | undefined
  // - submitted: boolean
  // - answers: ResultAnswer[]
  const {
    data: existingSubmission,
    isLoading: isLoadingSubmission,
    refetch: refetchSubmission,
  } = useSubmissionByAssignment(assignmentId ? parseInt(assignmentId) : 0, !!assignmentId);

  // Mutation để nộp bài
  const submitMutation = useSubmitSubmission();

  // ===========================
  // COMPUTED VALUES
  // ===========================
  const isLoading = isLoadingAssignment || isLoadingSubmission;
  const hasSubmitted = existingSubmission !== null && existingSubmission !== undefined && existingSubmission.submitted === true;
  const dueDate = assignment ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate ? dueDate < new Date() : false;

  // ===========================
  // HANDLERS
  // ===========================

  const handleAnswerChange = (questionId: number, answer: Answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    const answeredQuestions = Object.keys(selectedAnswers).length;
    const totalQuestions = assignment.question.length;

    if (answeredQuestions < totalQuestions) {
      toast.error(`Vui lòng trả lời tất cả ${totalQuestions} câu hỏi (Đã trả lời: ${answeredQuestions})`);
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn nộp bài? Sau khi nộp không thể thay đổi.")) {
      return;
    }

    const submissionData = {
      assignmentId: parseInt(assignmentId!),
      answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer,
      })),
    };

    console.log("📤 Submitting answers:", submissionData);

    submitMutation.mutate(submissionData, {
      onSuccess: () => {
        // Mutation trả void theo hook hiện tại => chỉ refetch và hiển thị toast
        toast.success("Nộp bài thành công!");
        // Clear selected answers (nếu muốn)
        setSelectedAnswers({});
        // Refetch submission để hiển thị kết quả (backend phải đã lưu)
        refetchSubmission();
      },
      onError: (err: any) => {
        const errMsg = err?.response?.data?.message || err?.message || "Nộp bài thất bại";
        toast.error(errMsg);
      },
    });
  };

  // ===========================
  // LOADING / ERROR / NOT FOUND
  // ===========================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin bài tập...</p>
        </div>
      </div>
    );
  }

  if (isErrorAssignment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách bài tập
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {errorAssignment?.message || "Không thể tải thông tin bài tập. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách bài tập
        </Button>
        <Alert>
          <AlertDescription>Không tìm thấy bài tập</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Safe helpers for submission
  const submissionAnswers = existingSubmission?.answers ?? [];
  const gradeNumber = existingSubmission?.grade ?? undefined;

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate("/assignments")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách bài tập
        </Button>
      </div>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>{assignment.title}</CardTitle>

                {hasSubmitted && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Đã nộp bài
                  </Badge>
                )}

                {isOverdue && !hasSubmitted && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Quá hạn
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Tạo lúc:{" "}
                {new Date(assignment.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Award className="w-4 h-4" />
                <span>{assignment.question.length} câu hỏi</span>
              </div>

              <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                <Calendar className="w-4 h-4" />
                <span>
                  Hạn:{" "}
                  {dueDate?.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {assignment.description && (
            <div>
              <h3 className="font-semibold mb-2">Mô tả bài tập</h3>
              <p className="text-muted-foreground">{assignment.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===========================
          NẾU ĐÃ NỘP BÀI - HIỂN THỊ KẾT QUẢ
          =========================== */}
      {hasSubmitted && existingSubmission ? (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả bài làm</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Thông tin điểm */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Điểm số</p>
                <p className="text-2xl font-bold text-blue-600">
                  {/* gradeNumber có thể undefined -> hiển thị 0.0 */}
                  {(gradeNumber ?? 0).toFixed(1)}/10
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Đúng</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissionAnswers.filter((a) => a.isCorrect).length}/{submissionAnswers.length}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Sai</p>
                <p className="text-2xl font-bold text-red-600">
                  {submissionAnswers.filter((a) => !a.isCorrect).length}/{submissionAnswers.length}
                </p>
              </div>
            </div>

            {/* Thời gian nộp */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Thời gian nộp</p>
              <p className="font-medium">
                {existingSubmission.submittedAt
                  ? new Date(existingSubmission.submittedAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>

            {/* Chi tiết từng câu hỏi */}
            <div>
              <h3 className="font-semibold mb-4">Chi tiết từng câu hỏi</h3>

              <div className="space-y-4">
                {submissionAnswers.map((answerData, index) => {
                  const isCorrect = answerData.isCorrect;
                  const userAnswer = answerData.answerOfUser;
                  const questionText = answerData.questionContent;

                  return (
                    <Card key={index} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                                Câu {index + 1}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {isCorrect ? "Đúng" : "Sai"}
                              </Badge>
                            </div>

                            <p className="font-medium">{questionText}</p>
                          </div>
                        </div>

                        <div className="space-y-2 pl-8">
                          {(["A", "B", "C", "D"] as const).map((letter) => {
                            const answerText = answerData[`answer${letter}` as keyof typeof answerData] as unknown as string;
                            const isUserChoice = userAnswer === letter;

                            return (
                              <div
                                key={letter}
                                className={`p-3 rounded-lg border ${
                                  isUserChoice ? (isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300") : "bg-white border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{letter}.</span>
                                  <span>{answerText}</span>

                                  {isUserChoice && (
                                    <Badge variant={isCorrect ? "default" : "destructive"} className="ml-auto text-xs">
                                      Bạn chọn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ===========================
            CHƯA NỘP BÀI - HIỂN THỊ FORM LÀM BÀI
            =========================== */
        <Card>
          <CardHeader>
            <CardTitle>Làm bài tập</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {isOverdue && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bài tập này đã quá hạn nộp. Bạn vẫn có thể làm bài nhưng có thể bị trừ điểm.
                </AlertDescription>
              </Alert>
            )}

            {/* Danh sách câu hỏi */}
            <div className="space-y-6">
              {assignment.question.map((q, index) => (
                <Card key={q.questionId} className="border-2">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Câu {index + 1}</Badge>
                      </div>
                      <p className="font-medium text-lg">{q.question}</p>
                    </div>

                    <RadioGroup
                      value={selectedAnswers[q.questionId] ?? ""}
                      onValueChange={(value) => handleAnswerChange(q.questionId, value as Answer)}
                    >
                      <div className="space-y-3">
                        {(["A", "B", "C", "D"] as Answer[]).map((letter) => {
                          // @ts-ignore - q[`answer${letter}`] dynamic access
                          const answerText = q[`answer${letter}`];
                          const isSelected = selectedAnswers[q.questionId] === letter;

                          return (
                            <div
                              key={letter}
                              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                                isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleAnswerChange(q.questionId, letter)}
                            >
                              <RadioGroupItem value={letter} id={`q${q.questionId}-${letter}`} />
                              <Label htmlFor={`q${q.questionId}-${letter}`} className="flex-1 cursor-pointer font-normal">
                                <span className="font-semibold mr-2">{letter}.</span>
                                {answerText}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tiến độ làm bài</span>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(selectedAnswers).length}/{assignment.question.length} câu
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(Object.keys(selectedAnswers).length / assignment.question.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-primary flex-1"
                disabled={submitMutation.isPending || Object.keys(selectedAnswers).length < assignment.question.length}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  "Nộp bài"
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate("/assignments")}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}