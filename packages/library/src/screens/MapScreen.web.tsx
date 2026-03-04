import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    Text,
    useThemedColors,
    GlobalHeader,
    Theme
} from '@repo/ui';
import * as d3 from 'd3';
import { libraryAPI } from '../api/library';
import { KnowledgeTopology, KnowledgeNode, KnowledgeLink } from '../types';

/**
 * MapScreen.web.tsx — The Infinite Cosmos
 * 
 * A high-fidelity D3-driven knowledge topology.
 * Leverages browser-native SVG rendering for a physics-based force graph.
 */

export default function MapScreen() {
    const colors = useThemedColors();
    const { width, height } = useWindowDimensions();
    const svgRef = useRef<SVGSVGElement>(null);
    const [data, setData] = useState<KnowledgeTopology | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);

    useEffect(() => {
        const fetchTopology = async () => {
            try {
                const topology = await libraryAPI.getMapTopology();
                setData(topology);
            } catch (err) {
                console.error('Failed to load topology', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopology();
    }, []);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous

        const canvasWidth = width - 64;
        const canvasHeight = height - 150;

        const simulation = d3.forceSimulation<KnowledgeNode>(data.nodes)
            .force("link", d3.forceLink<KnowledgeNode, KnowledgeLink>(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(canvasWidth / 2, canvasHeight / 2))
            .force("collision", d3.forceCollide().radius(50));

        const g = svg.append("g");

        // Add Zoom behavior
        svg.call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }));

        const link = g.append("g")
            .attr("stroke", colors.border)
            .attr("stroke-opacity", 0.3)
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke-width", (d: any) => Math.sqrt(d.value));

        const node = g.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(drag(simulation) as any)
            .on("mouseenter", (event, d) => setHoveredNode(d))
            .on("mouseleave", () => setHoveredNode(null));

        // Background circle for nodes
        node.append("circle")
            .attr("r", (d: any) => d.type === 'topic' ? 12 : 8)
            .attr("fill", (d: any) => d.type === 'topic' ? Theme.colors.sanctuarySaffron : colors.textPrimary)
            .attr("stroke", colors.secondary)
            .attr("stroke-width", 2);

        // Labels
        node.append("text")
            .text((d: any) => d.label)
            .attr("x", 15)
            .attr("y", 5)
            .style("font-size", "12px")
            .style("font-weight", "600")
            .attr("fill", colors.textPrimary)
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Drag functionality
        function drag(sim: any) {
            function dragstarted(event: any) {
                if (!event.active) sim.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event: any) {
                if (!event.active) sim.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

    }, [data, width, height, colors]);

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary }}>
            <GlobalHeader
                title="Knowledge Cosmos"
                subtitle="The Infinite topology"
                showBack
            />

            <Box sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                margin: Theme.spacing.lg,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {loading && (
                    <Box sx={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                        <ActivityIndicator size="large" />
                    </Box>
                )}

                {/* @ts-ignore - svg is valid in react-native-web context */}
                <svg
                    ref={svgRef}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {/* Retina Preview Overlay */}
                {hoveredNode && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 24,
                        right: 24,
                        padding: Theme.spacing.md,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 16,
                        maxWidth: 300,
                        borderWidth: 1,
                        borderColor: Theme.colors.sanctuarySaffron,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5
                    }}>
                        <Text sx={{ fontSize: 16, fontWeight: '800', color: '#000' }}>
                            {hoveredNode.label}
                        </Text>
                        <Text sx={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                            {hoveredNode.type.toUpperCase()} • {hoveredNode.group}
                        </Text>
                        {hoveredNode.metadata?.subject && (
                            <Box sx={{ marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Theme.colors.sanctuarySaffron + '22', borderRadius: 8, alignSelf: 'flex-start' }}>
                                <Text sx={{ fontSize: 10, fontWeight: '700', color: Theme.colors.sanctuarySaffron }}>
                                    {hoveredNode.metadata.subject}
                                </Text>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </VStack>
    );
}
