#include "PluginProcessor.h"
#include "PluginEditor.h"

namespace
{
    const juce::Colour matteCharcoal   { 0xff1c1c20 };
    const juce::Colour aqua            { 0xff4ce2d8 };
    const juce::Colour lavender        { 0xffb8a6ff };
}

ChefardsPieAudioProcessorEditor::ChefardsPieAudioProcessorEditor (ChefardsPieAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    titleLabel.setText ("Chefards Pie", juce::dontSendNotification);
    titleLabel.setJustificationType (juce::Justification::centred);
    titleLabel.setFont (juce::Font (juce::FontOptions (28.0f, juce::Font::bold)));
    titleLabel.setColour (juce::Label::textColourId, aqua);
    addAndMakeVisible (titleLabel);

    statusLabel.setText ("Alpha 0.1 - Instrument Shell", juce::dontSendNotification);
    statusLabel.setJustificationType (juce::Justification::centred);
    statusLabel.setFont (juce::Font (juce::FontOptions (16.0f)));
    statusLabel.setColour (juce::Label::textColourId, lavender);
    addAndMakeVisible (statusLabel);

    setResizable (true, true);
    setResizeLimits (400, 260, 1200, 800);
    setSize (600, 360);
}

ChefardsPieAudioProcessorEditor::~ChefardsPieAudioProcessorEditor() = default;

void ChefardsPieAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (matteCharcoal);

    g.setColour (aqua.withAlpha (0.25f));
    g.drawRect (getLocalBounds().reduced (4), 1);
}

void ChefardsPieAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds().reduced (20);
    titleLabel.setBounds (bounds.removeFromTop (60));
    bounds.removeFromTop (8);
    statusLabel.setBounds (bounds.removeFromTop (30));
}
