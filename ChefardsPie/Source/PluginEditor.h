#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

/**
    Alpha 0.1 editor shell: confirms the plugin window opens correctly in the
    host and shows basic identifying text. The full sectioned UI (Preset,
    Sound, Filter, Envelopes, Movement, FX, Macros, Master) is built once the
    parameters it displays exist.
*/
class ChefardsPieAudioProcessorEditor final : public juce::AudioProcessorEditor
{
public:
    explicit ChefardsPieAudioProcessorEditor (ChefardsPieAudioProcessor&);
    ~ChefardsPieAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

private:
    ChefardsPieAudioProcessor& audioProcessor;

    juce::Label titleLabel;
    juce::Label statusLabel;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (ChefardsPieAudioProcessorEditor)
};
