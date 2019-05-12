function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Click Clock Settings</Text>}>
        <Select
          label={`Date format`}
          settingsKey="selectedDate"
          options={[
            {name: "US"},
            {name: "Europe"}
          ]}
        />
        <Select
          label={`Distance units`}
          settingsKey="selectedUnits"
          options={[
            {name: "Km"},
            {name: "Miles"}
          ]}
        />
        </Section>
          <Section title={<Text bold align="center">Medical ID Information - Max 25 Characters Per line</Text>}>
          <TextInput
            label="Name"
            settingsKey="textName"
          />
          <TextInput
            label="Condition"
            settingsKey="textCond"
          />
           <TextInput
            label="ICE Call"
            settingsKey="textICE"
          />
       </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);