# Encounter Detection System

A Node.js application that detects physical encounters between monitored individuals using geographic coordinates and timestamps.

The system processes large text datasets through a streaming architecture, identifies encounters within a 20-meter radius, classifies each encounter, and exports the results as JSON files.

## Project Overview

The application was developed to identify encounters involving individuals monitored through electronic tracking devices.

It processes geographic records and determines whether two different individuals were within the specified distance at exactly the same timestamp.

The solution was designed to handle large datasets without loading the entire input file into memory.

## Business Rules

The detection algorithm follows these rules:

- **Distance:** An encounter is detected only when the distance is strictly less than 20 meters.
- **Distance calculation:** The Haversine formula is used with an Earth radius of 6,371,000 meters.
- **Timestamp:** Only records with exactly matching timestamps are compared.
- **Unique encounters:** Each pair of individuals can generate only one encounter per timestamp.
- **Pair ordering:** The order of individual IDs does not affect encounter identification.

### Encounter Classification

The system supports three encounter types:

| Type | Description |
|---|---|
| `generico` | Encounter between any two monitored individuals. |
| `faccao` | Encounter between individuals belonging to the same faction. |
| `protetiva` | Encounter between an offender and their corresponding protected victim. |

When multiple classifications apply to the same pair, the current implementation uses the following priority:

1. `protetiva`
2. `faccao`
3. `generico`

This priority is an implementation assumption because the challenge specification does not explicitly define precedence.

## Technical Architecture

The application uses a streaming pipeline:

1. Read the input file line by line.
2. Parse each record.
3. Group records by timestamp.
4. Detect encounters within each timestamp group.
5. Calculate geographic distances using the Haversine formula.
6. Classify qualifying encounters.
7. Write results incrementally to a JSON output file.

Because the input datasets are chronologically ordered, the application only needs to keep the current timestamp group in memory.

The output is also written incrementally using Node.js streams and backpressure handling.

## Project Structure

```text
detection-meetings/
├── datasets/
│   ├── dataset1.txt
│   ├── dataset2.txt
│   └── ...
├── outputs/
│   ├── dataset1-meetings.json
│   └── ...
├── src/
│   ├── parser.js
│   ├── grouping.js
│   ├── distance.js
│   ├── rules.js
│   ├── meeting-detector.js
│   ├── exporter.js
│   ├── check-order.js
│   └── process-dataset.js
├── tests/
│   ├── parser.test.js
│   ├── grouping.test.js
│   ├── distance.test.js
│   ├── detector.test.js
│   ├── exporter.test.js
│   ├── compare-output.js
│   ├── validate-output.js
│   └── benchmark.js
└── package.json
```

### Main Components

| File | Responsibility |
|---|---|
| `parser.js` | Converts input lines into structured JavaScript records. |
| `grouping.js` | Groups records by timestamp. |
| `distance.js` | Implements the Haversine distance calculation. |
| `rules.js` | Evaluates encounter classification rules. |
| `meeting-detector.js` | Identifies qualifying encounters and prevents duplicates. |
| `process-dataset.js` | Coordinates streaming input, detection, and output. |
| `validate-output.js` | Checks output structure and distance consistency. |
| `compare-output.js` | Compares generated results with available reference files. |
| `benchmark.js` | Measures processing time and memory usage. |

## Technologies

- JavaScript
- Node.js
- Node.js File System Streams
- Readline
- Haversine Formula
- JSON

No external runtime dependencies are required.

## Getting Started

### Requirements

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd detection-meetings
```

No additional package installation is necessary because the project uses Node.js built-in modules.

### Process a Dataset

To process a specific dataset:

```bash
npm run process -- 1
```

Replace `1` with a number from `1` to `7`.

The generated JSON file will be saved in the `outputs/` directory.

Example:

```text
outputs/dataset1-meetings.json
```

### Process All Datasets

Run the command for each dataset:

```bash
npm run process -- 1
npm run process -- 2
npm run process -- 3
npm run process -- 4
npm run process -- 5
npm run process -- 6
npm run process -- 7
```

## Testing and Validation

Run the complete test suite:

```bash
npm test
```

The test suite includes:

- Unit tests for parsing, grouping, distance calculation, detection, and exporting.
- Comparison against available official reference outputs.
- Structural validation of all seven generated JSON files.
- Distance recalculation to verify reported encounter distances.
- Duplicate encounter checks.

### Reference Validation

Official reference comparisons were successfully performed for datasets 1 and 2.

The remaining official reference files were not available in valid JSON format, so datasets 3 through 7 were validated using the project's structural and distance consistency checks instead.

## Performance Benchmark

The application was benchmarked using all seven datasets.

| Dataset | Records | Processing Time | Peak RSS |
|---|---:|---:|---:|
| 1 | 5,000 | 0.06 s | 47.70 MB |
| 2 | 25,000 | 0.15 s | 57.53 MB |
| 3 | 100,000 | 0.62 s | 65.89 MB |
| 4 | 400,020 | 1.75 s | 81.49 MB |
| 5 | 1,000,000 | 4.65 s | 82.55 MB |
| 6 | 8,000,000 | 42.76 s | 110.16 MB |
| 7 | 12,000,000 | 76.15 s | 161.52 MB |

### Overall Results

- **Total records processed:** 21,530,020
- **Total encounters detected:** 118
- **Total processing time:** 126.14 seconds
- **Highest observed RSS:** 161.52 MB

The benchmark executes datasets sequentially in a single Node.js process. Memory values are sampled every 100 milliseconds and should be interpreted as approximate measurements, not isolated peak measurements for independent processes.

To run the benchmark:

```bash
npm run test:performance
```

## Assumptions and Limitations

- Input records must be chronologically ordered by timestamp. The processing pipeline checks this condition.
- Records sharing the same timestamp are held in memory until their group has been processed.
- Pair comparisons within a timestamp group use a nested-loop approach.
- When multiple classifications apply, protective encounters take precedence over faction encounters.
- Official reference comparisons are limited to datasets 1 and 2 because the other reference files were unavailable in valid JSON format.

## Author

Developed as a technical challenge project using JavaScript and Node.js.

GitHub: https://github.com/Gabrielkk-prog