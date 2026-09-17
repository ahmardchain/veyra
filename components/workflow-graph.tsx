"use client";

import { useMemo, useState } from "react";
import { Background, BackgroundVariant, Controls, Handle, Position, ReactFlow, useNodesState, type Node, type NodeProps } from "@xyflow/react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Radio, ScanSearch, ChartNoAxesCombined, FileCheck2, UserRound, GripVertical } from "lucide-react";
import { AnimatedSwitch } from "@/components/spectrumui/animated-switch";
import { Card } from "@/components/ui/card";
import type { ClosePrintRun } from "@/lib/closeprint";

type StepData = { label: string; value: string; detail: string; kind: number; running: boolean; animate: boolean };
type StepNode = Node<StepData, "step">;
const icons = [FileText, Radio, ScanSearch, ChartNoAxesCombined, FileCheck2, UserRound];
const positions = [{ x: 0, y: 0 }, { x: 0, y: 200 }, { x: 320, y: 0 }, { x: 320, y: 200 }, { x: 640, y: 0 }, { x: 640, y: 200 }];
const initialNodes: StepNode[] = positions.map((position, kind) => ({ id: String(kind), type: "step", position, data: { label: "", value: "", detail: "", kind, running: false, animate: false } }));
const connections = [[0, 2], [1, 3], [2, 4], [3, 4], [4, 5]];

function WorkflowNode({ data, selected }: NodeProps<StepNode>) {
  const Icon = icons[data.kind];
  return <motion.div initial={false} animate={{ y: data.running && data.animate ? -3 : 0 }} transition={{ duration: .24 }}>
    <Card className={`workflow-node ${selected ? "is-selected" : ""} ${data.running ? "is-running" : ""}`}>
      {data.kind > 1 && <Handle type="target" position={data.kind === 5 ? Position.Top : Position.Left} isConnectable={false} />}
      <div className="node-heading"><span className="node-icon"><Icon size={18} /></span><span>{data.label}</span><GripVertical size={15} className="node-grip" /></div>
      <strong>{data.value}</strong><p>{data.detail}</p>
      <div className="node-footer"><span>{String(data.kind + 1).padStart(2, "0")}</span><span>{data.running ? "Recalculating" : data.kind === 5 ? "You stay in control" : "Inspect / drag"}</span></div>
      {data.kind < 5 && <Handle type="source" position={data.kind === 4 ? Position.Bottom : Position.Right} isConnectable={false} />}
    </Card>
  </motion.div>;
}
const nodeTypes = { step: WorkflowNode };

export function WorkflowGraph({ run, running }: { run: ClosePrintRun; running: boolean }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const animate = !paused && !reduced;
  const details = [
    { label: "Event packet", value: run.snapshot.asset + " · event evidence", detail: run.eventSource === "illustrative" ? "Illustrative packet · editable below" : "Your supplied event · unverified" },
    { label: "Bitget market", value: run.snapshot.source === "live" ? "Live venue snapshot" : "Illustrative book", detail: `${run.snapshot.symbol} · US cash ${run.snapshot.session}` },
    { label: "Event language", value: run.event.tone.toUpperCase(), detail: "Rules-based extraction · not an LLM" },
    { label: "Session + book math", value: `${run.market.spreadBps.toFixed(2)} bps spread`, detail: `${run.market.fillRatio.toFixed(2)} fill ratio · modeled impact` },
    { label: "ClosePrint brief", value: run.posture, detail: "Event + book + re-anchor sensitivity" },
    { label: "Human decision", value: "Review the evidence", detail: "Research only · no order is placed" },
  ];
  const displayNodes = nodes.map((node, kind) => ({ ...node, data: { ...node.data, ...details[kind], running: running && kind > 1 && kind < 5, animate } }));
  const edges = useMemo(() => connections.map(([source, target]) => ({ id: `${source}-${target}`, source: String(source), target: String(target), type: "default", animated: animate, style: { stroke: running ? "#75a5ff" : "#626b7c", strokeWidth: 1.5 } })), [animate, running]);
  return <div className="graph-canvas" aria-label="Interactive Veyra research workflow">
    <ReactFlow nodes={displayNodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: .16 }} minZoom={.35} maxZoom={1.5} nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null} zoomOnScroll={false} colorMode="dark">
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#303033" />
      <Controls showInteractive={false} />
    </ReactFlow>
    <div className="graph-caption"><span>Drag to explore · pinch to zoom</span><div className="motion-control"><span>Motion {animate ? "on" : "off"}</span><AnimatedSwitch label="Workflow motion" checked={animate} disabled={!!reduced} onCheckedChange={(checked) => setPaused(!checked)} /></div></div>
  </div>;
}
