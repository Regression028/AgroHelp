// app/utils/cropParser.ts
interface Crop {
    name: string;
    hybrid: string;
    irrigation: string;
    water: string;
    yield: string;
    profit: string;
    reason: string;
  }
  
  function extractCrops(sectionText: string): Crop[] {
    const cropRegex =
      /\d+\.\s+\*\*Crop:\s*([^*]+)\*\*([\s\S]*?)(?=\n\s*\d+\.\s+\*\*Crop:|$)/g;
  
    const crops: Crop[] = [];
    let match;
  
    while ((match = cropRegex.exec(sectionText)) !== null) {
      const block = match[2];
  
      crops.push({
        name: match[1].trim(),
        hybrid: block.match(/Best hybrid:\s*(.+)/)?.[1] || "—",
        irrigation: block.match(/Irrigation:\s*(.+)/)?.[1] || "—",
        water: block.match(/Water requirement:\s*(.+)/)?.[1] || "—",
        yield: block.match(/Yield:\s*(.+)/)?.[1] || "—",
        profit: block.match(/Estimated profit:\s*(.+)/)?.[1] || "—",
        reason: block.match(/Reason:\s*(.+)/)?.[1] || "—",
      });
    }
  
    return crops;
  }
  
  export function parseCrops(text: string, category: string): Crop[] {
    const sections = text.split("### ");
    
    for (const sec of sections) {
      if (sec.includes(category)) {
        return extractCrops(sec);
      }
    }
    
    return [];
  }