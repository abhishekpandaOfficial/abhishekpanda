import { useState, useEffect } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import {
  GripVertical,
  Type,
  Image,
  Square,
  Minus,
  Link,
  Trash2,
  Plus,
  Copy,
  Eye,
  Code,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EmailBlock {
  id: string;
  type: "heading" | "text" | "image" | "button" | "divider" | "spacer";
  content: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    padding?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
    src?: string;
    href?: string;
  };
}

interface EmailTemplateBuilderProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  variables?: string[];
}

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Type },
  { type: "text", label: "Text", icon: AlignLeft },
  { type: "image", label: "Image", icon: Image },
  { type: "button", label: "Button", icon: Square },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: Square },
];

const createDefaultBlock = (type: string): EmailBlock => {
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const defaults: Record<string, Partial<EmailBlock>> = {
    heading: {
      content: "Heading Text",
      styles: { fontSize: "24px", fontWeight: "bold", textAlign: "left", color: "#333333" },
    },
    text: {
      content: "Your text content here. Use {{variables}} to insert dynamic content.",
      styles: { fontSize: "16px", textAlign: "left", color: "#666666" },
    },
    image: {
      content: "",
      styles: { src: "https://via.placeholder.com/600x200", width: "100%", borderRadius: "8px" },
    },
    button: {
      content: "Click Here",
      styles: { 
        backgroundColor: "#3B82F6", 
        color: "#FFFFFF", 
        padding: "12px 24px", 
        borderRadius: "8px",
        textAlign: "center",
        href: "#",
      },
    },
    divider: {
      content: "",
      styles: { height: "1px", backgroundColor: "#E5E7EB" },
    },
    spacer: {
      content: "",
      styles: { height: "24px" },
    },
  };

  return {
    id,
    type: type as EmailBlock["type"],
    content: defaults[type]?.content || "",
    styles: defaults[type]?.styles || {},
  };
};

const BlockEditor = ({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  variables = [],
}: {
  block: EmailBlock;
  onUpdate: (block: EmailBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  variables?: string[];
}) => {
  const updateStyles = (key: string, value: string) => {
    onUpdate({
      ...block,
      styles: { ...block.styles, [key]: value },
    });
  };

  return (
    <div className="space-y-4 p-4 border-t border-border">
      {/* Content */}
      {(block.type === "heading" || block.type === "text") && (
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            placeholder="Enter text..."
            className="min-h-[80px]"
          />
          {variables.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {variables.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => onUpdate({ ...block, content: block.content + `{{${v}}}` })}
                >
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {block.type === "button" && (
        <>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input
              value={block.styles.href || ""}
              onChange={(e) => updateStyles("href", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={block.styles.src || ""}
            onChange={(e) => updateStyles("src", e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Style Controls */}
      <div className="grid grid-cols-2 gap-4">
        {(block.type === "heading" || block.type === "text" || block.type === "button") && (
          <>
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={block.styles.fontSize || "16px"}
                onValueChange={(v) => updateStyles("fontSize", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                  <SelectItem value="20px">20px</SelectItem>
                  <SelectItem value="24px">24px</SelectItem>
                  <SelectItem value="32px">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.styles.color || "#333333"}
                  onChange={(e) => updateStyles("color", e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input
                  value={block.styles.color || "#333333"}
                  onChange={(e) => updateStyles("color", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </>
        )}

        {block.type === "button" && (
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={block.styles.backgroundColor || "#3B82F6"}
                onChange={(e) => updateStyles("backgroundColor", e.target.value)}
                className="w-12 h-9 p-1"
              />
              <Input
                value={block.styles.backgroundColor || "#3B82F6"}
                onChange={(e) => updateStyles("backgroundColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {(block.type === "divider" || block.type === "spacer") && (
          <div className="space-y-2">
            <Label>Height</Label>
            <Input
              value={block.styles.height || "24px"}
              onChange={(e) => updateStyles("height", e.target.value)}
              placeholder="24px"
            />
          </div>
        )}
      </div>

      {/* Alignment */}
      {(block.type === "heading" || block.type === "text" || block.type === "button") && (
        <div className="space-y-2">
          <Label>Alignment</Label>
          <div className="flex gap-2">
            {["left", "center", "right"].map((align) => (
              <Button
                key={align}
                variant={block.styles.textAlign === align ? "default" : "outline"}
                size="sm"
                onClick={() => updateStyles("textAlign", align)}
              >
                {align === "left" && <AlignLeft className="w-4 h-4" />}
                {align === "center" && <AlignCenter className="w-4 h-4" />}
                {align === "right" && <AlignRight className="w-4 h-4" />}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-1" />
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

const BlockPreview = ({ block }: { block: EmailBlock }) => {
  const baseStyles: React.CSSProperties = {
    textAlign: block.styles.textAlign as any,
    color: block.styles.color,
    fontSize: block.styles.fontSize,
    fontWeight: block.styles.fontWeight,
  };

  switch (block.type) {
    case "heading":
      return <h2 style={baseStyles}>{block.content}</h2>;
    case "text":
      return <p style={baseStyles}>{block.content}</p>;
    case "image":
      return (
        <img
          src={block.styles.src}
          alt=""
          style={{
            width: block.styles.width || "100%",
            borderRadius: block.styles.borderRadius,
            display: "block",
          }}
        />
      );
    case "button":
      return (
        <div style={{ textAlign: block.styles.textAlign as any || "center" }}>
          <a
            href={block.styles.href || "#"}
            style={{
              display: "inline-block",
              padding: block.styles.padding || "12px 24px",
              backgroundColor: block.styles.backgroundColor || "#3B82F6",
              color: block.styles.color || "#FFFFFF",
              borderRadius: block.styles.borderRadius || "8px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            {block.content}
          </a>
        </div>
      );
    case "divider":
      return (
        <hr
          style={{
            border: "none",
            height: block.styles.height || "1px",
            backgroundColor: block.styles.backgroundColor || "#E5E7EB",
          }}
        />
      );
    case "spacer":
      return <div style={{ height: block.styles.height || "24px" }} />;
    default:
      return null;
  }
};

export const EmailTemplateBuilder = ({
  blocks,
  onChange,
  variables = [],
}: EmailTemplateBuilderProps) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "html">("edit");

  const addBlock = (type: string) => {
    const newBlock = createDefaultBlock(type);
    onChange([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updatedBlock: EmailBlock) => {
    onChange(blocks.map((b) => (b.id === id ? updatedBlock : b)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const duplicateBlock = (block: EmailBlock) => {
    const newBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const index = blocks.findIndex((b) => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const generateHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 24px;">
    ${blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            return `<h2 style="margin: 0 0 16px; font-size: ${block.styles.fontSize}; font-weight: ${block.styles.fontWeight}; color: ${block.styles.color}; text-align: ${block.styles.textAlign};">${block.content}</h2>`;
          case "text":
            return `<p style="margin: 0 0 16px; font-size: ${block.styles.fontSize}; color: ${block.styles.color}; text-align: ${block.styles.textAlign}; line-height: 1.6;">${block.content}</p>`;
          case "image":
            return `<img src="${block.styles.src}" alt="" style="width: ${block.styles.width}; border-radius: ${block.styles.borderRadius}; display: block; margin: 0 0 16px;" />`;
          case "button":
            return `<div style="text-align: ${block.styles.textAlign}; margin: 0 0 16px;"><a href="${block.styles.href}" style="display: inline-block; padding: ${block.styles.padding}; background-color: ${block.styles.backgroundColor}; color: ${block.styles.color}; border-radius: ${block.styles.borderRadius}; text-decoration: none; font-weight: 500;">${block.content}</a></div>`;
          case "divider":
            return `<hr style="border: none; height: ${block.styles.height}; background-color: ${block.styles.backgroundColor}; margin: 16px 0;" />`;
          case "spacer":
            return `<div style="height: ${block.styles.height};"></div>`;
          default:
            return "";
        }
      })
      .join("\n    ")}
  </div>
</body>
</html>`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Block Palette */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Add Blocks</h3>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => addBlock(type)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Variables */}
        {variables.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Available Variables</h4>
            <div className="flex flex-wrap gap-1">
              {variables.map((v) => (
                <Badge key={v} variant="secondary" className="text-xs">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Email Builder</h3>
          <div className="flex gap-2">
            <Button
              variant={previewMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("edit")}
            >
              <Palette className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant={previewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("preview")}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              variant={previewMode === "html" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode("html")}
            >
              <Code className="w-4 h-4 mr-1" />
              HTML
            </Button>
          </div>
        </div>

        {previewMode === "edit" && (
          <Card>
            <CardContent className="p-4">
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Add blocks from the left panel to build your email</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={blocks}
                  onReorder={onChange}
                  className="space-y-3"
                >
                  {blocks.map((block) => (
                    <Reorder.Item
                      key={block.id}
                      value={block}
                      className={cn(
                        "border rounded-lg bg-card cursor-move transition-shadow",
                        selectedBlockId === block.id && "ring-2 ring-primary"
                      )}
                    >
                      <div
                        className="p-4 flex items-start gap-3"
                        onClick={() =>
                          setSelectedBlockId(selectedBlockId === block.id ? null : block.id)
                        }
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <BlockPreview block={block} />
                        </div>
                      </div>
                      {selectedBlockId === block.id && (
                        <BlockEditor
                          block={block}
                          onUpdate={(updated) => updateBlock(block.id, updated)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block)}
                          variables={variables}
                        />
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </CardContent>
          </Card>
        )}

        {previewMode === "preview" && (
          <Card>
            <CardContent className="p-0">
              <div
                className="bg-muted/50 p-8"
                style={{ minHeight: "400px" }}
              >
                <div className="max-w-[600px] mx-auto bg-background rounded-lg p-6 shadow-sm">
                  {blocks.map((block) => (
                    <div key={block.id} className="mb-4 last:mb-0">
                      <BlockPreview block={block} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {previewMode === "html" && (
          <Card>
            <CardContent className="p-4">
              <Textarea
                value={generateHtml()}
                readOnly
                className="min-h-[400px] font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(generateHtml());
                }}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy HTML
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateBuilder;
