import { useMemo } from "react";
import { FERTILIZER_PROFILES } from "../constants";

/**
 * Custom hook for instantaneous, edge-like client-side NPK calculation (0ms delay)
 */
export function useFertilizerCalculation(fertCrop, fertArea, fertUnit, fertStage) {
  return useMemo(() => {
    const profile = FERTILIZER_PROFILES[fertCrop] || FERTILIZER_PROFILES["Tomato"];
    const areaMultiplier =
      fertUnit === "Guntas" ? 0.025 : fertUnit === "Bighas" ? 0.625 : fertUnit === "Hectares" ? 2.471 : 1.0;
    const numArea = parseFloat(fertArea) || 0.1;
    const acres = Math.max(0.01, parseFloat((numArea * areaMultiplier).toFixed(3)));

    let stageFactor = 1.0;
    if (fertStage.includes("Basal")) stageFactor = 0.40;
    else if (fertStage.includes("Vegetative") || fertStage.includes("Tillering")) stageFactor = 0.35;
    else if (fertStage.includes("Flowering") || fertStage.includes("Pre-Bloom")) stageFactor = 0.25;
    else if (fertStage.includes("Fruiting") || fertStage.includes("Grain")) stageFactor = 0.25;

    const pureN = parseFloat((profile.pureN * acres * stageFactor).toFixed(1));
    const pureP = parseFloat((profile.pureP * acres * stageFactor).toFixed(1));
    const pureK = parseFloat((profile.pureK * acres * stageFactor).toFixed(1));

    const dapKg = parseFloat((pureP / 0.46).toFixed(1));
    const dapBags = parseFloat((dapKg / 50.0).toFixed(1));
    const nFromDap = parseFloat((dapKg * 0.18).toFixed(1));

    const remN = Math.max(0, pureN - nFromDap);
    const ureaKg = parseFloat((remN / 0.46).toFixed(1));
    const ureaBags = parseFloat((ureaKg / 45.0).toFixed(1));

    const mopKg = parseFloat((pureK / 0.60).toFixed(1));
    const mopBags = parseFloat((mopKg / 50.0).toFixed(1));

    const ureaCost = Math.round(ureaBags * 266.5);
    const dapCost = Math.round(dapBags * 1350.0);
    const mopCost = Math.round(mopBags * 1700.0);
    const totalCost = ureaCost + dapCost + mopCost;

    const fymTons = parseFloat((profile.fym * acres).toFixed(1));
    const vermicompostKg = Math.round(profile.vermicompost * acres);
    const neemCakeKg = Math.round(profile.neemCake * acres);

    return {
      acres,
      pureN,
      pureP,
      pureK,
      ureaKg,
      ureaBags,
      ureaCost,
      dapKg,
      dapBags,
      dapCost,
      mopKg,
      mopBags,
      mopCost,
      totalCost,
      fymTons,
      vermicompostKg,
      neemCakeKg,
      biofertilizers: profile.biofertilizers,
      benefits: profile.benefits,
      schedules: profile.schedules,
      tips: profile.tips
    };
  }, [fertCrop, fertArea, fertUnit, fertStage]);
}
