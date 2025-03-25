Save your favorite sites in Local storage and view them nicely in web page.
Export local storage saved bookmarks to file in CSV format.
Import bookmarks from exported CSV file and also HTML file (Which is downloaded from chrome bookmarks manager).
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;

public class GuessingGame {
    private int numberToGuess;
    private int attemptsLeft = 5;
    private JFrame frame;
    private JTextField inputField;
    private JLabel messageLabel, attemptsLabel;

    public GuessingGame() {
        setupGame();
    }

    public void setupGame() {
        numberToGuess = new Random().nextInt(20) + 1;
        attemptsLeft = 5;

        frame = new JFrame("Guessing Game");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 300);

        JPanel panel = new JPanel();
        panel.setLayout(new BorderLayout());

        messageLabel = new JLabel("Guess a number between 1 and 20!");
        messageLabel.setHorizontalAlignment(SwingConstants.CENTER);
        panel.add(messageLabel, BorderLayout.NORTH);

        inputField = new JTextField();
        panel.add(inputField, BorderLayout.CENTER);

        JButton guessButton = new JButton("Guess");
        guessButton.addActionListener(new GuessActionListener());
        panel.add(guessButton, BorderLayout.SOUTH);

        attemptsLabel = new JLabel("Attempts left: " + attemptsLeft);
        attemptsLabel.setHorizontalAlignment(SwingConstants.CENTER);
        panel.add(attemptsLabel, BorderLayout.WEST);

        frame.add(panel);
        frame.setVisible(true);
    }

    private class GuessActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            String input = inputField.getText();
            try {
                int guess = Integer.parseInt(input);
                if (guess < 1 || guess > 20) {
                    JOptionPane.showMessageDialog(frame, "Please enter a valid number between 1 and 20.");
                    return;
                }

                attemptsLeft--;
                attemptsLabel.setText("Attempts left: " + attemptsLeft);

                if (guess == numberToGuess) {
                    JOptionPane.showMessageDialog(frame, "I'm a winner!", "Congratulations", JOptionPane.INFORMATION_MESSAGE);
                    showRestartDialog();
                } else if (guess < numberToGuess) {
                    messageLabel.setText("LOW!");
                } else {
                    messageLabel.setText("HIGH!");
                }

                if (attemptsLeft == 0) {
                    JOptionPane.showMessageDialog(frame, "YOU LOSE!", "Game Over", JOptionPane.ERROR_MESSAGE);
                    showRestartDialog();
                } else if (attemptsLeft == 1) {
                    JOptionPane.showMessageDialog(frame, "Oh no! 1 Guess to go");
                }
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(frame, "Invalid input. Please enter a number.");
            }
        }
    }

    private void showRestartDialog() {
        int response = JOptionPane.showConfirmDialog(frame, "Do you want to restart the game?", "Restart Game",
                JOptionPane.YES_NO_OPTION);
        if (response == JOptionPane.YES_OPTION) {
            frame.dispose();
            new GuessingGame();
        } else {
            frame.dispose();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(GuessingGame::new);
    }
}