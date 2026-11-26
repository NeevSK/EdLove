import "@typespec/protobuf";
import "@typespec/http";
import "@typespec/openapi";
using Protobuf;
using Http;
using OpenAPI;

@TypeSpec.service(#{ title: "Portable" })
@package({ name: "gurudevi.lms.v1" })
namespace Gurudevi.Lms.V1;

/** Decimal carried as string: proto has no decimal type. */
scalar DecimalString extends string;

model Mark {
  @field(1) studentId: string;
  @field(2) present: boolean;
  @field(3) note?: string;
}

model MarkAttendanceRequest {
  @field(1) sessionId: string;
  @field(2) marks: Mark[];
}

model MarkAttendanceResponse {
  @field(1) presentCount: int32;
  @field(2) absentCount: int32;
  @field(3) fee: DecimalString;
}

@Protobuf.service
interface Attendance {
  @route("/lms/attendance/mark") @post
  @operationId("lms.attendance.mark")
  @extension("x-cedar-action", "Lms::MarkAttendance")
  mark(...MarkAttendanceRequest): MarkAttendanceResponse;
}
