# GURUDEVI GRADING SYSTEM DESIGN
**Date**: February 4, 2026

---

## 📊 DUAL GRADING SYSTEM

### **System A: Traditional Marks (0-100)**
- Teacher enters marks out of 100
- System calculates rank (if requested)
- Display: "85/100" or "85%"

### **System B: GPA (New Reforms)**
- Teacher enters marks, system converts to GPA
- OR teacher directly assigns grade (A, B, C, D, E, S, F)
- Calculate GPA on 4.0 scale
- Display: "A (3.7 GPA)" or "75 (B - 3.0 GPA)"

---

## 🎯 TEACHER SELECTION

**At Classroom Level** (teacher chooses once per classroom):

```typescript
interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
  gpa_scale: '4.0' | '5.0'; // For future flexibility
}
```

**UI** (in Classroom Settings):
```
┌─────────────────────────────────┐
│  Grading System                  │
│                                  │
│  ○ Marks Only (0-100)            │
│  ○ GPA Only                      │
│  ● Both (Marks + GPA)            │
│                                  │
│  ☑︎ Show class ranks              │
│                                  │
│  [Save]                          │
└─────────────────────────────────┘
```

---

## 📐 GPA CONVERSION TABLE

**Based on Sri Lankan Education System** (will verify with web search):

| Marks Range | Grade | Grade Points (4.0 scale) | Description |
|-------------|-------|--------------------------|-------------|
| 75-100      | A     | 4.0                      | Excellent   |
| 65-74       | B     | 3.0                      | Very Good   |
| 55-64       | C     | 2.0                      | Good        |
| 45-54       | D     | 1.0                      | Satisfactory|
| 35-44       | E     | 0.5                      | Pass        |
| 25-34       | S     | 0.0                      | Fail        |
| 0-24        | F     | 0.0                      | Fail        |

**Conversion Function**:
```typescript
function marksToGPA(marks: number): { grade: string; gpa: number } {
  if (marks >= 75) return { grade: 'A', gpa: 4.0 };
  if (marks >= 65) return { grade: 'B', gpa: 3.0 };
  if (marks >= 55) return { grade: 'C', gpa: 2.0 };
  if (marks >= 45) return { grade: 'D', gpa: 1.0 };
  if (marks >= 35) return { grade: 'E', gpa: 0.5 };
  if (marks >= 25) return { grade: 'S', gpa: 0.0 };
  return { grade: 'F', gpa: 0.0 };
}
```

---

## 🏆 RANK CALCULATION

**Only when teacher enables "Show Ranks"**:

```typescript
function calculateRanks(grades: StudentGrade[]): StudentGrade[] {
  // Sort by marks (descending)
  const sorted = [...grades].sort((a, b) => b.marks - a.marks);
  
  // Assign ranks (handle ties)
  let currentRank = 1;
  return sorted.map((grade, index) => {
    // If same marks as previous, same rank
    if (index > 0 && grade.marks === sorted[index - 1].marks) {
      return { ...grade, rank: sorted[index - 1].rank };
    }
    return { ...grade, rank: currentRank++ };
  });
}
```

**Display**:
```
# Marks Mode
┌─────────────────────────────────┐
│  Nimal Perera      85/100  #2   │
│  Suresh Kumar      92/100  #1   │
│  Amara Silva       85/100  #2   │ (tie)
└─────────────────────────────────┘

# GPA Mode
┌─────────────────────────────────┐
│  Nimal Perera      A (4.0)  #2  │
│  Suresh Kumar      A (4.0)  #1  │
│  Amara Silva       B (3.0)  #3  │
└─────────────────────────────────┘
```

---

## 💾 DATA MODEL

```typescript
interface StudentGrade {
  id: string;
  student_id: string;
  classroom_id: string;
  assignment_id: string;
  
  // Raw data
  marks: number; // 0-100 (always store this)
  
  // Computed (from marks)
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'S' | 'F';
  gpa?: number;
  rank?: number; // Only if show_ranks enabled
  
  // Metadata
  graded_by: string;
  graded_at: Date;
  feedback?: string;
}
```

**Storage strategy**:
- Always store marks (0-100)
- Compute grade/GPA on read (based on classroom settings)
- Compute ranks on demand (when viewing gradebook)

---

## 🎨 UI COMPONENTS

### **Grade Entry Form** (Teacher View):

```tsx
<GradeEntryForm>
  <StudentName>Nimal Perera</StudentName>
  
  {/* Marks input is ALWAYS shown */}
  <Input
    label="Marks"
    type="number"
    min={0}
    max={100}
    value={marks}
    onChange={setMarks}
  />
  
  {/* Auto-computed preview */}
  {gradingMode === 'gpa' || gradingMode === 'both' ? (
    <ComputedGPA>
      Grade: {marksToGPA(marks).grade} ({marksToGPA(marks).gpa} GPA)
    </ComputedGPA>
  ) : null}
  
  {/* Optional feedback */}
  <TextArea
    label="Feedback (Optional)"
    value={feedback}
    onChange={setFeedback}
  />
  
  <Button onPress={saveGrade}>Save Grade</Button>
</GradeEntryForm>
```

### **Gradebook View** (Teacher View):

```tsx
<Gradebook>
  <SettingsButton onPress={openGradingSettings}>
    ⚙️ Grading Settings
  </SettingsButton>
  
  <Table>
    <Header>
      <Column>Student</Column>
      <Column>
        {gradingMode === 'marks' ? 'Marks' : 
         gradingMode === 'gpa' ? 'Grade' : 
         'Marks / Grade'}
      </Column>
      {showRanks && <Column>Rank</Column>}
    </Header>
    
    {students.map(student => (
      <Row key={student.id}>
        <Cell>{student.name}</Cell>
        <Cell>
          {gradingMode === 'marks' && `${student.marks}/100`}
          {gradingMode === 'gpa' && `${student.grade} (${student.gpa})`}
          {gradingMode === 'both' && `${student.marks} (${student.grade})`}
        </Cell>
        {showRanks && <Cell>#{student.rank}</Cell>}
      </Row>
    ))}
  </Table>
</Gradebook>
```

### **Student Report Card** (Student View):

```tsx
<ReportCard>
  <Subject name="Mathematics">
    <Assignment name="Algebra Quiz">
      <Marks>85/100</Marks>
      {showGPA && <Grade>A (4.0 GPA)</Grade>}
      {showRanks && <Rank>#2 in class</Rank>}
      <Feedback>Excellent work on quadratic equations!</Feedback>
    </Assignment>
    
    <Assignment name="Geometry Test">
      <Marks>72/100</Marks>
      {showGPA && <Grade>B (3.0 GPA)</Grade>}
    </Assignment>
    
    <OverallGPA>3.5 GPA</OverallGPA>
  </Subject>
</ReportCard>
```

---

## 🔄 WORKFLOW

### **Scenario 1: Teacher Using Marks Only**
```
1. Teacher creates classroom
2. Settings: "Marks Only" mode
3. Teacher enters: "85" → Student sees "85/100"
4. If ranks enabled: Student sees "85/100 #2"
```

### **Scenario 2: Teacher Using GPA**
```
1. Teacher creates classroom
2. Settings: "GPA Only" mode
3. Teacher enters: "85" → System converts → Student sees "A (4.0 GPA)"
4. If ranks enabled: Student sees "A (4.0 GPA) #2"
```

### **Scenario 3: Teacher Using Both**
```
1. Teacher creates classroom
2. Settings: "Both" mode
3. Teacher enters: "85" → Student sees "85/100 - Grade A (4.0 GPA)"
4. Report card shows both representations
```

---

## 📱 MULTILINGUAL LABELS

```json
// i18n/locales/si.json
{
  "grades": {
    "marks": "ලකුණු",
    "outOf": "න්",
    "grade": "ශ්‍රේණිය",
    "gpa": "GPA",
    "rank": "ශ්‍රේණිය",
    "gradingMode": "ලකුණු ක්‍රමය",
    "marksOnly": "ලකුණු පමණයි",
    "gpaOnly": "GPA පමණයි",
    "both": "දෙකම",
    "showRanks": "ශ්‍රේණි පෙන්වන්න"
  }
}
```

---

## ✅ SUMMARY

**For Database** (when you're ready):
- Store: marks (0-100) always
- Compute: grade, GPA, rank on read

**For UI** (can build now):
- Grade entry form
- Gradebook table
- Report card view
- Grading settings modal

**Teacher Choice**:
- Marks only (traditional)
- GPA only (new reforms)
- Both (transition period)

**Want me to build the grading components now (no database needed)?**
